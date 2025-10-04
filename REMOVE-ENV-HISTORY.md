# 🗑️ Eliminar .env.local del Historial de Git

## ⚠️ ADVERTENCIA

Este proceso **REESCRIBE TODO EL HISTORIAL** del repositorio. Es irreversible.

- ✅ Elimina `.env.local` de todos los commits
- ⚠️ Cambia todos los commit hashes (SHAs)
- ⚠️ Requiere force-push
- ⚠️ Colaboradores deben re-clonar el repo

---

## 🔧 Método 1: BFG Repo-Cleaner (Recomendado)

### Paso 1: Descargar BFG

1. Ve a: https://rtyley.github.io/bfg-repo-cleaner/
2. Descarga `bfg-1.14.0.jar`
3. Guárdalo en: `C:\Users\user\Downloads\bfg.jar`

### Paso 2: Hacer Backup

```powershell
# Crear backup completo del repo
cd C:\Users\user\Desktop
cp -Recurse Mercadillo Mercadillo-BACKUP
```

### Paso 3: Ejecutar BFG

```powershell
cd C:\Users\user\Desktop\Mercadillo

# Asegurar que .env.local no está en working tree
git rm --cached .env.local
git commit -m "Remove .env.local from tracking"

# Limpiar historial con BFG
java -jar C:\Users\user\Downloads\bfg.jar --delete-files .env.local
```

### Paso 4: Limpiar Referencias

```powershell
# Limpiar refs y objetos
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### Paso 5: Force Push

```powershell
# ⚠️ CUIDADO: Esto reescribe el historial remoto
git push origin main --force
```

### Paso 6: Verificar

```powershell
# Verificar que .env.local ya no está en el historial
git log --all --full-history -- ".env.local"
# Debería estar vacío ✅
```

---

## 🔧 Método 2: Git Filter-Repo (Alternativa)

### Paso 1: Instalar

```powershell
pip install git-filter-repo
```

### Paso 2: Ejecutar

```powershell
cd C:\Users\user\Desktop\Mercadillo

# Eliminar .env.local del historial
git filter-repo --path .env.local --invert-paths --force
```

### Paso 3: Re-agregar Remoto

```powershell
# Filter-repo elimina los remotes por seguridad
git remote add origin https://github.com/cabezassebastian/Mercadillo.git
```

### Paso 4: Force Push

```powershell
git push origin main --force
```

---

## 🔧 Método 3: Git Filter-Branch (Manual, más lento)

```powershell
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all

git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin main --force
```

---

## ⚠️ IMPORTANTE: Después del Force Push

### 1. Actualizar Vercel

Vercel detectará el force push y puede tener issues. Verifica:

- Dashboard → Mercadillo → Deployments
- Si hay errores, hacer "Redeploy"

### 2. Si tienes colaboradores

```powershell
# Cada colaborador debe hacer:
cd ruta/al/repo
git fetch origin
git reset --hard origin/main
```

O mejor: re-clonar el repositorio.

---

## ✅ Verificación Final

```powershell
# 1. Verificar que .env.local no está en historial
git log --all --full-history -- ".env.local"
# Output: vacío ✅

# 2. Verificar que .gitignore lo protege
git check-ignore .env.local
# Output: .env.local ✅

# 3. Verificar que existe localmente pero no en repo
ls .env.local        # Debería existir ✅
git status           # No debería aparecer ✅
```

---

## 🎯 Mi Recomendación

**Opción 1 (BFG)** es la más segura y rápida:

- ✅ Herramienta probada y confiable
- ✅ ~10 minutos total
- ✅ Maneja casos edge automáticamente
- ✅ Menos riesgo de errores

**Tiempo total: ~10 minutos**

---

## 🚨 Alternativa Más Rápida: Hacer Repo Privado

Si no quieres reescribir el historial:

1. GitHub → Settings → Change visibility → Private
2. **Tiempo: 2 minutos**
3. Las claves quedan protegidas aunque sigan en el historial

**Ventaja:** Sin riesgo, instantáneo  
**Desventaja:** Las claves siguen en el historial (pero privado)

---

## ❓ ¿Qué Prefieres?

**A.** Limpiar historial con BFG (10 min, elimina claves del historial) 🗑️  
**B.** Hacer repo privado (2 min, protege pero no elimina) 🔒  

Dime y te guío paso a paso.
