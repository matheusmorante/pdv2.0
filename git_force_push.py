import subprocess
import os

def run_git():
    try:
        # Tenta pegar o remoto
        remote = subprocess.check_output(["git", "remote", "-v"], stderr=subprocess.STDOUT, shell=True).decode('utf-8')
        print("Remotos encontrados:\n", remote)
        
        # Tenta o push forçado
        print("Iniciando git push origin main -f...")
        push = subprocess.check_output(["git", "push", "origin", "main", "-f"], stderr=subprocess.STDOUT, shell=True).decode('utf-8')
        print("Resultado do Push:\n", push)
        
    except subprocess.CalledProcessError as e:
        print(f"Erro ao executar comando: {e.output.decode('utf-8')}")
    except Exception as e:
        print(f"Erro inesperado: {str(e)}")

if __name__ == "__main__":
    run_git()
