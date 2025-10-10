# syntax=docker/dockerfile:1.7

FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH=":/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/usr/lib/wsl/lib:/mnt/c/Users/Eric/AppData/Local/Temp/.tmph1GjCC:/mnt/c/Program Files/Common Files/Oracle/Java/javapath:/mnt/c/Windows/system32:/mnt/c/Windows:/mnt/c/Windows/System32/Wbem:/mnt/c/Windows/System32/WindowsPowerShell/v1.0/:/mnt/c/Windows/System32/OpenSSH/:/mnt/c/Program Files/NVIDIA Corporation/NVIDIA NvDLISR:/mnt/c/Program Files (x86)/NVIDIA Corporation/PhysX/Common:/mnt/c/WINDOWS/system32:/mnt/c/WINDOWS:/mnt/c/WINDOWS/System32/Wbem:/mnt/c/WINDOWS/System32/WindowsPowerShell/v1.0/:/mnt/c/WINDOWS/System32/OpenSSH/:/mnt/c/msys64/mingw64/bin:/mnt/c/Program Files/Git/cmd:/mnt/c/Program Files/nodejs/:/mnt/c/sqlite3:/mnt/c/Program Files (x86)/Windows Kits/10/Windows Performance Toolkit/:/mnt/c/Program Files/cursor/resources/app/bin:/mnt/c/Program Files/Docker/Docker/resources/bin:/mnt/c/Users/Eric/AppData/Local/Programs/Python/Python313/Scripts/:/mnt/c/Users/Eric/AppData/Local/Programs/Python/Python313/:/mnt/c/Users/Eric/AppData/Local/Programs/Python/Launcher/:/mnt/c/Users/Eric/AppData/Local/Microsoft/WindowsApps:/mnt/c/Users/Eric/AppData/Local/Programs/Microsoft VS Code/bin:/mnt/c/Users/Eric/AppData/Roaming/npm:/mnt/c/Users/Eric/AppData/Local/GitHubDesktop/bin:/mnt/c/Users/Eric/AppData/Local/Programs/Windsurf/bin:/mnt/c/Users/Eric/bin:/mnt/c/Users/Eric/.vscode/extensions/openai.chatgpt-0.4.19-win32-x64/bin/windows-x86_64"
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci
RUN npx prisma generate

FROM deps AS builder
COPY . .
RUN npm run build

FROM node:20-slim AS runner
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["npm", "run", "start"]
