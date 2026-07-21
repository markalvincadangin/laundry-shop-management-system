# Build Standalone Windows Installer with jpackage
Write-Host "Building Maven Project..."
cd ..\backend
mvn clean package -P standalone -DskipTests

$jarPath = "target\laundryms-backend-0.0.1-SNAPSHOT.jar"
$appName = "FaithLaundryMS"
$appVersion = "1.0.0"

Write-Host "Packaging with jpackage..."
jpackage --name $appName `
  --input target `
  --main-jar laundryms-backend-0.0.1-SNAPSHOT.jar `
  --app-version $appVersion `
  --type msi `
  --win-dir-chooser `
  --win-shortcut `
  --win-menu `
  --java-options "-Xmx512m"

Write-Host "MSI Installer generated successfully!"
