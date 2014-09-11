// Script for generating Spark download links
// No dependencies; pure javascript.

releases = {};

function addRelease(version, releaseDate, packages, downloadable) {
  releases[version] = {released: releaseDate, packages: packages, downloadable: downloadable};
}

var sources = ["sources"];
// 0.7+
var packagesV1 = sources.concat(["hadoop1", "cdh4"]);
// 0.8.1+
var packagesV2 = packagesV1.concat(["hadoop2"]);
// 1.0.1+
var packagesV3 = packagesV2.concat(["mapr3", "mapr4"]);
// 1.1.0+
var packagesV4 = packagesV1.concat(["hadoop2.3", "hadoop2.4", "mapr3", "mapr4"]);

addRelease("1.1.0", new Date("9/11/2014"), packagesV4, true);
addRelease("1.0.2", new Date("8/5/2014"), packagesV3, true);
addRelease("1.0.1", new Date("7/11/2014"), packagesV3);
addRelease("1.0.0", new Date("5/30/2014"), packagesV2);
addRelease("0.9.2", new Date("7/23/2014"), packagesV2, true);
addRelease("0.9.1", new Date("4/9/2014"), packagesV2);
addRelease("0.9.0-incubating", new Date("2/2/2014"), packagesV2);
addRelease("0.8.1-incubating", new Date("12/19/2013"), packagesV2, true);
addRelease("0.8.0-incubating", new Date("9/25/2013"), packagesV1, true);
addRelease("0.7.3", new Date("7/16/2013"), packagesV1, true);
addRelease("0.7.2", new Date("2/6/2013"), packagesV1);
addRelease("0.7.0", new Date("2/27/2013"), sources);

function append(el, contents) {
  el.innerHTML = el.innerHTML + contents;
};

function empty(el) {
  el.innerHTML = "";
}

function getSelectedValue(selectEl) {
  return selectEl.options[selectEl.selectedIndex].value;
}

function versionShort(version) { return version.replace(/-incubating/, ""); }

function initDownloads() {
  var versionSelect = document.getElementById("sparkVersionSelect");

  // Populate versions
  for (var version in releases) {
    var releaseDate = releases[version].released;
    var downloadable = releases[version].downloadable;

    if (!downloadable) { continue; }

    // Don't display incubation status here
    var title = versionShort(version) + " (" + releaseDate.toDateString().slice(4) + ")";
    append(versionSelect, "<option value=\"" + version + "\">" + title + "</option>");
  }

  // Populate packages and (transitively) releases
  onVersionSelect();
}

function initReleaseNotes() {
  var releaseNotes = document.getElementById("sparkReleaseNotes");
  for (var version in releases) {
    var releaseDate = releases[version].released;
    var verShort = versionShort(version);
    var contents = "<li><a href='releases/spark-release-$verUrl.html'>Spark $ver</a> ($date)</li>"
      .replace(/\$verUrl/, verShort.replace(/\./g, "-"))
      .replace(/\$ver/, verShort)
      .replace(/\$date/, releaseDate.toDateString().slice(4))
    append(releaseNotes, contents);
  }
}

function onVersionSelect() {
  var versionSelect = document.getElementById("sparkVersionSelect");
  var packageSelect = document.getElementById("sparkPackageSelect");
  var verifyLink = document.getElementById("sparkDownloadVerify");

  empty(packageSelect);
  empty(verifyLink);

  var version = getSelectedValue(versionSelect);
  var packages = releases[version]["packages"];
  for (var idx in packages) {
    append(packageSelect, "<option>" + packages[idx] + "</option>")
  }

  var href = "http://www.apache.org/dist/spark/spark-" + version + "/";
  var link = "<a href=\"" + href + "\">" + versionShort(version) + " signatures and checksums</a>"
  append(verifyLink, link);

  // Populate releases
  onPackageSelect();
  updateDownloadLink();
}

function onPackageSelect() {
  var downloadSelect = document.getElementById("sparkDownloadSelect");
  var packageSelect = document.getElementById("sparkPackageSelect");

  empty(downloadSelect);

  var pkg = getSelectedValue(packageSelect);

  if (pkg.toLowerCase().indexOf("mapr") > -1) {
    var external = "External Download (MAY CONTAIN INCOMPATIBLE LICENSES)";
    append(downloadSelect, "<option value='external'>" + external + "</option>");
  } else {
    append(downloadSelect, "<option value='direct'>Direct Download</option>")
    append(downloadSelect, "<option value='apache'>Select Apache Mirror</option>")
  }
  updateDownloadLink();
}

function onDownloadSelect() {
  updateDownloadLink();
}

function updateDownloadLink() {
  var versionSelect = document.getElementById("sparkVersionSelect");
  var packageSelect = document.getElementById("sparkPackageSelect");
  var downloadSelect = document.getElementById("sparkDownloadSelect");
  var downloadLink = document.getElementById("spanDownloadLink");

  empty(downloadLink);

  var version = getSelectedValue(versionSelect);
  var pkg = getSelectedValue(packageSelect);
  var download = getSelectedValue(downloadSelect);


  var artifactName = "spark-$ver-bin-$pkg.tgz"
    .replace(/\$ver/g, version)
    .replace(/\$pkg/g, pkg)
    .replace(/-bin-sources/, ""); // special case for source packages

  var link = "http://d3kbcqa49mib13.cloudfront.net/$artifact";
  if (version <= "0.7.3") {
    link = "http://spark-project.org/download/$artifact";
  }
  if (pkg.toLowerCase().indexOf("mapr") > -1) {
    link = "http://package.mapr.com/tools/apache-spark/$ver/$artifact"
  } else if (download == "apache") {
    link = "http://www.apache.org/dyn/closer.cgi/spark/spark-$ver/$artifact";
  }
  link = link
    .replace(/\$ver/, version)
    .replace(/\$artifact/, artifactName);
  var text = link.split("/").reverse()[0];

  var onClick = "trackOutboundLink(this, 'Release Download Links', " +
    "'$download_$artifact'); return false;"
      .replace(/\$download/, download)
      .replace(/\$artifact/, artifactName);

  var contents = "<a href=\"" + link + "\">" + text + "</a>";
  append(downloadLink, contents);
}
