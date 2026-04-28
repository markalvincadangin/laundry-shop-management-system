@echo off
setlocal enabledelayedexpansion
for /f "usebackq tokens=1* delims==" %%a in (".env") do (
    set "Line=%%a"
    if not "!Line:~0,1!"=="#" (
        if not "%%b"=="" set "%%a=%%b"
    )
)
mvnw.cmd spring-boot:run
