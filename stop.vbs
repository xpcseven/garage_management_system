Set shell = CreateObject("WScript.Shell")
shell.Run "cmd /c taskkill /f /im node.exe", 0, False