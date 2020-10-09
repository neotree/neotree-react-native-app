import XLSX from "xlsx";
import * as FileSystem from "expo-file-system";
import * as Permissions from "expo-permissions";
import * as MediaLibrary from "expo-media-library";
import { Alert } from "react-native";
import {
  exportSession,
  exportPersonRegToEHR,
  exportDemographicsToEHR,
  exportPatientAdmissionToEHR,
} from "@/api/export";
import {importPerson} from "@/api/import" 
import { updateSessions } from "@/api/sessions";
import { insertEhrNeotree, getEhrNeotree } from "@/api/ehr_neotree";
import moment from "moment";
import getJSON from "./getJSON";
import getValueFromKey from "./getValueFromKey";
import getJWTToken from "./getJWTToken";

export { getJSON };

const getDate = () => moment(new Date()).format("YYYYMMDDhmm");

const exportSuccessAlert = (msg = "") => {
  Alert.alert(
    "",
    msg,
    [
      {
        text: "OK",
        onPress: () => {},
      },
    ],
    { cancelable: true }
  );
};

export function exportJSON() {
  const { sessions } = this.state;

  const scripts = sessions.reduce(
    (acc, { data: { script } }) => ({
      ...acc,
      [script.id]: script,
    }),
    {}
  );

  const saveFile = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (status === "granted") {
      this.setState({ exporting: true });

      const json = getJSON(sessions).reduce(
        (acc, e) => ({
          ...acc,
          [e.script.id]: [...(acc[e.script.id] || []), e],
        }),
        {}
      );

      const done = () => {
        this.setState({ exporting: false });
        exportSuccessAlert("File saved in NeoTree folder");
      };

      Promise.all(
        Object.keys(json).map((scriptId) => {
          const scriptTitle = scripts[scriptId].data.title;
          const fileUri = `${
            FileSystem.documentDirectory
          }${getDate()}-${scriptTitle.replace(/[^a-zA-Z0-9]/gi, "_")}.json`;
          return new Promise((resolve) => {
            (async () => {
              await FileSystem.writeAsStringAsync(
                fileUri,
                JSON.stringify({ sessions: json[scriptId] }, null, 4),
                { encoding: FileSystem.EncodingType.UTF8 }
              );
              const asset = await MediaLibrary.createAssetAsync(fileUri);
              await MediaLibrary.createAlbumAsync("NeoTree", asset, false);
              resolve();
            })();
          });
        })
      )
        .then(done)
        .catch(done);
    }
  };

  saveFile();
}

export function exportEXCEL() {
  const { sessions } = this.state;

  const scripts = sessions.reduce(
    (acc, { data: { script } }) => ({
      ...acc,
      [script.id]: script,
    }),
    {}
  );

  const json = getJSON(sessions).reduce(
    (acc, e) => ({
      ...acc,
      [e.script.id]: [...(acc[e.script.id] || []), e],
    }),
    {}
  );

  const sheets = Object.keys(json).map((scriptId) => {
    const scriptTitle = scripts[scriptId].data.title;
    const fileUri = `${
      FileSystem.documentDirectory
    }${getDate()}-${scriptTitle.replace(/[^a-zA-Z0-9]/gi, "_")}.xlsx`;

    const data = json[scriptId]
      .map((e) =>
        e.entries.reduce(
          (acc, e) => ({
            ...acc,
            [e.key || "N/A"]: e.values.map((v) => v.value || "N/A").join(", "),
          }),
          null
        )
      )
      .filter((e) => e);

    const ws = XLSX.utils.json_to_sheet(data);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, scriptTitle);

    const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });

    return [fileUri, wbout];
  });

  if (sheets.length) {
    this.setState({ exporting: true });

    sheets.map(([fileUri, wbout]) => {
      const saveFile = async () => {
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        if (status === "granted") {
          await FileSystem.writeAsStringAsync(fileUri, wbout, {
            encoding: FileSystem.EncodingType.Base64,
          });
          const asset = await MediaLibrary.createAssetAsync(fileUri);
          await MediaLibrary.createAlbumAsync("NeoTree", asset, false);
          this.setState({ exporting: false });
          exportSuccessAlert("File saved in NeoTree folder");
        }
      };

      saveFile();
    });
  }

  // writeFile(file, wbout, 'ascii').then(console.log).catch(console.log);
}

export function exportToApi() {
  console.log(this.state.sessions.filter((s) => !s.exported));
  const sessions = this.state.sessions.filter((s) => !s.exported);
  const postData = getJSON(sessions);

  this.setState({ exporting: true });

  Promise.all(
    postData.map(
      (s, i) =>
        new Promise((resolve, reject) => {
          exportSession(s)
            .then((rslt) => {
              const id = sessions[i].id;
              updateSessions({ exported: true }, { where: { id } }).then(() =>
                this.setState(({ sessions }) => ({
                  sessions: sessions.map((s) => ({
                    ...s,
                    exported: s.id === id ? true : s.exported,
                  })),
                }))
              );
              resolve(rslt);
            })
            .catch((e) => {
              reject(e);
            });
        })
    )
  )
    .then(() => {
      this.setState({ exporting: false });
      exportSuccessAlert("Export complete");
    })
    .catch(() => {
      this.setState({ exporting: false });
      exportSuccessAlert("Export complete");
    });
}

export function exportToEhr() {
  const sessions = this.state.sessions.filter(
    (s) => !s.exported && s.data.script.data.title.includes("EHR")
  );
  const postData = getJSON(sessions);

  return new Promise((resolve, reject) => {
    this.setState({ exporting: true });

    Promise.all(
      postData.map((s, i) =>
        new Promise(async (resolve, reject) => {
          const item = postData[i] ? postData[i].entries : null;
      
          if (item && item != null) {
            const firstname = getValueFromKey(item, "firstname");
            const lastname = getValueFromKey(item, "lastname");
            const birthdate = getValueFromKey(item, "birthdate");
            const sex = getValueFromKey(item, "sex");
            const educationId = getValueFromKey(item, "educationId");
            const occupationId = getValueFromKey(item, "occupationId");
            const maritalId = getValueFromKey(item, "maritalId");
            const religionId = getValueFromKey(item, "religionId");
            const nationalityId = getValueFromKey(item, "nationalityId");
            const countryOfBirthId = getValueFromKey(item, "countryOfBirthId");
            const selfIdentifiedGender = getValueFromKey(
              item,
              "selfIdentifiedGender"
            );
            const wardId = getValueFromKey(item, "wardId");

            const personRegistrationDTO = {
              firstname: firstname,
              lastname: lastname,
              birthdate: birthdate,
              sex: sex,
            };
            const updatePersonDTO = {
              firstname: firstname,
              lastname: lastname,
              birthdate: birthdate,
              sex: sex,
              educationId: educationId,
              occupationId: occupationId,
              maritalId: maritalId,
              religionId: religionId,
              nationalityId: nationalityId,
              countryOfBirthId: countryOfBirthId,
              selfIdentifiedGender: selfIdentifiedGender,
            };
            const admissionDTO = { wardId: wardId };

            const token = await getJWTToken();
            console.log("######---Token---",token)
            exportPersonRegToEHR(personRegistrationDTO, { jwtToken: token })
              .then((rslt) => {
                const result = JSON.parse(rslt);
                const neotree_id = sessions[i].id;
                const opts = {
                  ehr_personId: result.id,
                  neotree_id: neotree_id,
                  source: "neotree",
                };

                insertEhrNeotree(opts)
                  .then(() => {
                    getEhrNeotree({}).then((res=>{
                     const queryResult = `{  personId
                      lastname
                      firstname
                      fullname
                      sex
                      birthdate
                      infant
                      education{
                        id,
                        name
                      }
                      occupation{
                        id,
                        name
                      }
                      marital{
                        id,
                        name
                      }
                      religion{
                        id,
                        name
                      }
                      nationality{
                        id,
                        name
                      }
                      denomination{
                        id,
                        name
                      }
                      countryOfBirth{
                        id,
                        name
                      }
                    }}`
                    importPerson(queryResult,res.ehr_personId)
                    }))
                    exportDemographicsToEHR(
                      { ...updatePersonDTO, personId: result.id },
                      { jwtToken: token }
                    )
                      .then(() => {
                        exportPatientAdmissionToEHR(
                          { ...admissionDTO, personId: result.id },
                          { jwtToken: token }
                        )
                          .then(() => {
                            const id = sessions[i].id;
                            updateSessions(
                              { exported: true },
                              { where: { id } }
                            ).then(() =>
                              this.setState(({ sessions }) => ({
                                sessions: sessions.map((s) => ({
                                  ...s,
                                  exported: s.id === id ? true : s.exported,
                                })),
                              }))
                            );
                          })
                          .then(() => {
                            this.setState({ exporting: false });
                            exportSuccessAlert("Export complete");
                          });
                      })

                      .catch((e) => {
                        this.setState({ exporting: false });
                        console.log("==w1",e)
                        exportSuccessAlert("Something Wicked Happened!!");
                      });
                  })
                  .catch((e) => {
                    this.setState({ exporting: false });
                    console.log("==w2",e)
                    exportSuccessAlert("Eomething Wicket Happened 2");
                  });
              })
              .catch((e) => {
                this.setState({ exporting: false });
                console.log("==w3",e)
                exportSuccessAlert("Eomething Wicket Happened 3");
              });
          } else {
            this.setState({ exporting: false });
            console.log("==wde1",e)
            exportSuccessAlert("No Data To Export!!");
          }
        })
          .catch((e) => {
            this.setState({ exporting: false });
            console.log("==w4",e)
            exportSuccessAlert("Eomething Wicket Happened 4");
          })
          .catch((e) => {
            this.setState({ exporting: false });
            console.log("==w5",e)
            exportSuccessAlert("Eomething Wicket Happened 5");
          })
      )
    );
  });
}
