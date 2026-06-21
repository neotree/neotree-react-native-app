const fs = require("fs");

function registerAndroidReactPackage(mainApplicationPath, packageClassName) {
  if (!fs.existsSync(mainApplicationPath)) {
    throw new Error(`Cannot register ${packageClassName}: MainApplication.kt was not generated`);
  }

  let source = fs.readFileSync(mainApplicationPath, "utf8");
  const registration = `packages.add(${packageClassName}())`;

  if (source.includes(registration)) return;

  const mutablePackageList = /^(\s*)val packages = PackageList\(this\)\.packages\.toMutableList\(\)\s*$/m;
  const returnMutablePackages = /^(\s*)return packages\s*$/m;
  const returnAutolinkedPackages = /^(\s*)return PackageList\(this\)\.packages\s*$/m;

  if (mutablePackageList.test(source) && returnMutablePackages.test(source)) {
    source = source.replace(
      returnMutablePackages,
      (_, indentation) => `${indentation}${registration}\n${indentation}return packages`,
    );
  } else if (returnAutolinkedPackages.test(source)) {
    source = source.replace(
      returnAutolinkedPackages,
      (_, indentation) => [
        `${indentation}val packages = PackageList(this).packages.toMutableList()`,
        `${indentation}${registration}`,
        `${indentation}return packages`,
      ].join("\n"),
    );
  } else {
    throw new Error(
      `Cannot register ${packageClassName}: unsupported MainApplication.kt package-list structure`,
    );
  }

  fs.writeFileSync(mainApplicationPath, source);
}

module.exports = { registerAndroidReactPackage };
