import os
import subprocess
import shutil

# Input for Google CRD SSH Code
CRD_SSH_Code = input("Google CRD SSH Code: ")
username = "user"  # @param {type:"string"}
password = "root"  # @param {type:"string"}

Pin = 123456  # @param {type: "integer"}
Autostart = True  # @param {type: "boolean"}

class CRDSetup:
    def __init__(self, user):
        self.installCRD()
        self.installGoogleChrome()
        self.installTelegram()
        self.changewall()
        self.finish(user)

    @staticmethod
    def installCRD():
        # Download and install Chrome Remote Desktop for Windows
        url = "https://dl.google.com/chrome-remote-desktop/chrome-remote-desktop.msi"
        try:
            subprocess.run([r'C:\Windows\System32\msiexec.exe', '/i', url, '/quiet'], check=True)
            print("Chrome Remote Desktop Installed!")
        except subprocess.CalledProcessError as e:
            print(f"Failed to install Chrome Remote Desktop: {e}")

    @staticmethod
    def installGoogleChrome():
        # Download and install Google Chrome for Windows
        url = "https://dl.google.com/chrome/install/latest/chrome_installer.exe"
        try:
            # Download the installer
            installer_path = os.path.join(os.environ['TEMP'], 'chrome_installer.exe')
            subprocess.run(['curl', '-o', installer_path, url], check=True)
            # Install Google Chrome
            subprocess.run([installer_path, '/silent', '/install'], check=True)
            print("Google Chrome Installed!")
        except Exception as e:
            print(f"Failed to install Google Chrome: {e}")

    @staticmethod
    def installTelegram():
        # Download and install Telegram for Windows
        url = "https://telegram.org/dl/desktop/windows"
        try:
            subprocess.run(['start', url], shell=True)
            print("Telegram Installed! Please complete the installation manually.")
        except Exception as e:
            print(f"Failed to initiate Telegram installation: {e}")

    @staticmethod
    def changewall():
        # Change wallpaper on Windows
        wallpaper_url = "https://gitlab.com/chamod12/changewallpaper-win10/-/raw/main/CachedImage_1024_768_POS4.jpg"
        wallpaper_path = os.path.join(os.environ['USERPROFILE'], 'Pictures', 'xfce-verticals.png')
        try:
            subprocess.run(['curl', '-o', wallpaper_path, wallpaper_url], check=True)
            # Set the wallpaper using PowerShell
            subprocess.run(['powershell', '-command', f'Set-ItemProperty -Path "HKCU:Control Panel\Desktop" -Name Wallpaper -Value "{wallpaper_path}"'])
            subprocess.run(['powershell', '-command', 'RUNDLL32.EXE user32.dll,UpdatePerUserSystemParameters'])
            print("Wallpaper Changed!")
        except Exception as e:
            print(f"Failed to change wallpaper: {e}")

    @staticmethod
    def finish(user):
        if Autostart:
            # Create a shortcut for autostart
            startup_folder = os.path.join(os.environ['APPDATA'], 'Microsoft\Windows\Start Menu\Programs\Startup')
            link = "https://www.youtube.com/@The_Disala"
            shortcut_path = os.path.join(startup_folder, "Colab.url")
            with open(shortcut_path, "w") as f:
                f.write(f"[InternetShortcut]\nURL={link}\n")
            print("Autostart link created!")

        command = f'"{os.environ["PROGRAMFILES(X86)"]}\\Google\\Chrome Remote Desktop\\CurrentVersion\\remoting_start_host.exe" --code="{CRD_SSH_Code}" --redirect-url="https://remotedesktop.google.com/_/oauthredirect" --name={os.environ["COMPUTERNAME"]}'
        try:
            subprocess.run(['runas', '/user:' + user, command], shell=True)
            print("Remote Desktop command executed.")
        except Exception as e:
            print(f"Failed to execute remote desktop command: {e}")

        print("Log in PIN: 123456") 
        print("User Name: user") 
        print("User Pass: root") 
        while True:
            pass

try:
    if CRD_SSH_Code == "":
        print("Please enter authcode from the given link")
    elif len(str(Pin)) < 6:
        print("Enter a pin more or equal to 6 digits")
    else:
        CRDSetup(username)
except NameError as e:
    print("'username' variable not found, Create a user first")
