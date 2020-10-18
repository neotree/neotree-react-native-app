import { Alert } from "react-native";
import { importPerson } from "@/api/data-import";
import { updateEhrSessions, getSessions } from "@/api/sessions";
import getJSON from "../export/getJSON";
import mapEhrValuesToNeotreeKeys from "../export/mapEhrValuesToNeotreeKeys";
import { getEhrNeotree } from "@/api/ehr_neotree";

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

export async function importFromEhr() {
  const ids = [];
  const personIds = [];
  await getEhrNeotree({})
    .then((res) => {
      if (res && res.ehr_neotree) {
        res.ehr_neotree.map((r, i) => {
          personIds.push(r.ehr_personId);
          ids.push(r.id);
        });
      }
      return ids;
    })
    .catch((e) => {});

  const sessions = await this.state.sessions.filter((s) => ids.includes(s.id));

  //const postData = await getJSON(sessions);

  return new Promise((resolve, reject) => {
    this.setState({ exporting: true });

    Promise.all(
      personIds.map((p, i) => {
        importPerson(p)
          .then(async (r) => {
            const imported =  mapEhrValuesToNeotreeKeys(r.data.person);
            console.log("----IMPORTED--",imported)
            this.setState({ exporting: false });
            const ehrNeotree = await getEhrNeotree({ ehr_personId: p });
            
            const session =
              sessions && sessions.length > 0
                ? sessions.filter(async (ses) => {
                    ses.id =
                      ehrNeotree &&
                      ehrNeotree.ehr_neotree &&
                      ehrNeotree.ehr_neotree[0]
                        ? ehrNeotree.ehr_neotree[0].neotree_id
                        : 0;
                  })[0]
                : {};
        
            const values =
              session && session.data && session.data.form
                ? session.data.form.map((f) => {
                    const values = [];
                    f.values.map((v) => {
                      imported.map((i) => {
                        if (v.key === i.key) {
                          values.push({ ...v, ...i });
                        }
                      });
                    });
                    return values;
                  })
                : [];
            updateEhrSessions({
              ...session,
              data: {
                ...session.data,
                form: [
                  ...session.data.form.map((v, i) => ({
                    ...v,
                    values: [
                      ...(v.values =
                        values[i] && values[i].length > 0
                          ? values[i]
                          : v.values),
                    ],
                  })),
                ],
              },
            })
              .then(async() => {
                const updatedSessions = await getSessions({});
                this.setState({ sessions: updatedSessions });
                exportSuccessAlert("Data Imported Successfully");
              })
              .catch((e) => {
                this.setState({ exporting: false });
                exportSuccessAlert("SOMETHING WICKED HAPPENED!!");
              });
          })
          .catch((e) => {
            this.setState({ exporting: false });
            console.log("%%===ERROR-",e)
            exportSuccessAlert("SOMETHING WICKED HAPPENED2!!");
          });
      })
    );
  });
}
