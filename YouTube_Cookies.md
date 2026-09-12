YouTube Downloader system required YouTube cookies please follow the instructions below:

1. Open Firefox and log in to YouTube (preferably a dedicated account).
2. Type `about:profiles` in the address bar and find the profile marked "Default: Yes". Note its **Root Directory** path.
3. **Close Firefox completely** (SQLite locks the file while the browser is running).
4. Copy the cookie database:
```bash
   mkdir -p ~/ff-profile
   cp <profile-path>/cookies.sqlite* ~/ff-profile/
```
5. Mount that folder into the Docker container:
```bash
   docker run -v <ff-profile_folder_path>:/FFvert/ff-profile -p 3003:3003 --name=FFvert ghcr.io/nahida4479/ffvert:latest
```
