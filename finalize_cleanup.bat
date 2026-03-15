@echo off
echo Finalizing Multi-Repo Migration...

mkdir "c:\Users\mathe\OneDrive\Área de Trabalho\projetos\morante-hub\shared-utils\migration-scripts" 2>nul

echo Moving scripts...
move "c:\Users\mathe\OneDrive\Área de Trabalho\projetos\morante-hub\erp-admin\src\*.cjs" "c:\Users\mathe\OneDrive\Área de Trabalho\projetos\morante-hub\shared-utils\migration-scripts\"
move "c:\Users\mathe\OneDrive\Área de Trabalho\projetos\morante-hub\erp-admin\src\migrate_db.js" "c:\Users\mathe\OneDrive\Área de Trabalho\projetos\morante-hub\shared-utils\migration-scripts\"

echo Cleanup...
rmdir /s /q "c:\Users\mathe\OneDrive\Área de Trabalho\projetos\moveismorantehub"

echo Done.
