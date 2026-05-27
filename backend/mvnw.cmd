@echo off
setlocal

set BASE_DIR=%~dp0
set MAVEN_VERSION=3.9.11

if exist "%BASE_DIR%\.mvn\apache-maven-%MAVEN_VERSION%\bin\mvn.cmd" (
  "%BASE_DIR%\.mvn\apache-maven-%MAVEN_VERSION%\bin\mvn.cmd" -f "%BASE_DIR%\pom.xml" %*
  exit /b %ERRORLEVEL%
)

echo Maven distribution is not installed. Run ./mvnw from a Unix-like shell or install Maven locally.
exit /b 1
