# 🔧 Resend Email Debugging Guide

## Problème Diagnostiqué

**Les emails de bienvenue ne s'envoyaient PAS** à cause de 3 bugs critiques:

### 1. ❌ Server Action pas awaité
```javascript
// BEFORE (bugué)
sendWelcomeEmailAction(...).catch(err => {...});
```
La fonction retournait `success: true` AVANT que le fetch ne s'exécute. Si le navigateur fermait la page, le fetch était annulé.

### 2. ❌ Pas de gestion d'erreur du fetch
Le `fetch` pouvait échouer silencieusement sans jamais logguer le problème.

### 3. ❌ Pas de timeout
Un fetch sans timeout peut attendre indéfiniment, tuant le worker Vercel.

---

## ✅ Solutions Implémentées

### Fix 1: Server Action → API Route Interne
```javascript
// AFTER (corrigé)
const emailResult = await sendWelcomeEmailViaAPI(user.email, user.name);
if (!emailResult.success) {
  console.warn('[SA] Welcome email failed:', emailResult.error);
}
```

**Avantages:**
- ✅ Await correct = email garanti ou erreur connue
- ✅ API route a `maxDuration = 60s` sur Vercel Pro
- ✅ Meilleure gestion d'erreur

### Fix 2: API Route Améliorée
```
/api/emails/send/route.ts
- Timeout de 30s (Resend API)
- Retry logic (2 retries pour erreurs transientes)
- Logging détaillé
- Validation de RESEND_API_KEY
```

### Fix 3: Config Vercel
```json
{
  "functions": {
    "api/emails/send": {
      "maxDuration": 60
    }
  }
}
```

---

## 🧪 Comment Tester

### Test 1: Validation locale
```bash
# Charge les env vars
source .env.local

# Test direct avec le script
node scripts/test-email.mjs test@example.com
```

**Expected output:**
```
Status: 200
Response: { "id": "email_xxx" }
✅ SUCCESS! Email ID: email_xxx
```

### Test 2: Test l'API route localement
```bash
# Démarre le serveur local
npm run dev

# En parallèle, teste l'endpoint
curl -X POST http://localhost:3000/api/emails/send \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","type":"welcome"}'
```

**Expected output:**
```json
{
  "success": true,
  "emailId": "email_xxx"
}
```

### Test 3: Teste l'inscription complète
1. Va sur https://astra-website.vercel.app
2. S'inscrit avec un email valide
3. Vérifie les logs Resend Dashboard: https://dashboard.resend.com/logs

**Where to look in Vercel logs:**
- Ouvre https://vercel.com → astra-website → Deployments
- Click latest deployment → Functions
- Filtre par `[EmailAPI]` ou `[EmailViaAPI]`

---

## 🔍 Checklist de Dépannage

- [ ] RESEND_API_KEY est dans `.env.local` (dev) et Vercel Dashboard (prod)
- [ ] RESEND_API_KEY commence par `re_live_` (production) ou `re_dev_` (test)
- [ ] API key n'est pas expirée/révoquée
- [ ] Domaine `astra@astra-ia.dev` est vérifié dans Resend Dashboard
- [ ] Pas de rate limiting (Resend free tier: 100 emails/day)
- [ ] Vérifiez `/api/emails/send` répond avec `Content-Type: application/json`
- [ ] Vérifiez logs Vercel pour `[EmailAPI]` et `[EmailViaAPI]`
- [ ] Testez avec curl avant de chercher ailleurs

---

## 📊 Diagnostics Avancés

### Si ça marche en local mais pas en prod:

1. **Vérifiez RESEND_API_KEY en Vercel:**
   - Vercel Dashboard → astra-website → Settings → Environment Variables
   - Confirme `RESEND_API_KEY` existe

2. **Rebuild la deployment:**
   ```
   Vercel Dashboard → Deployments → Latest → Redeploy
   ```

3. **Vérifiez maxDuration:**
   - Vous êtes sur **Vercel Pro** (60s max)?
   - Vercel Free tier = 10s max (peut pas être overridé)

### Si vous voyez timeout en logs:

```
[EmailAPI] ❌ Exception: Resend API timeout
```

Solutions:
- Augmentez timeout (actuellement 30s)
- Vérifiez status.resend.com (outage?)
- Testez avec un email différent
- Contactez Resend support

### Si vous voyez "No ID in response":

```
[EmailAPI] ❌ No ID in response
```

Cela signifie que Resend a retourné une réponse mais sans `id`. Logguement:
```javascript
const data = await response.json();
console.log('[EmailAPI] Full response:', JSON.stringify(data));
```

---

## 🚀 Prochaines Étapes Optionnelles

### 1. Queue system (ex: Bull, Vercel KV)
Si vous avez besoin de **vraie persistence** et **retry automatique**:
```
registerUser() → Queue /api/emails/send → Worker
```

### 2. Webhook Resend
Recevez notifications quand Resend envoie/bounce/fail:
```
https://dashboard.resend.com → Webhooks
```

### 3. Email preview (développement)
```bash
npm install -D react-email
```

---

## 📝 Files Modifiées

- `app/actions/auth.ts` — Server Action corrigé
- `app/api/emails/send/route.ts` — API route avec retry
- `vercel.json` — Config maxDuration
- `scripts/test-email.mjs` — Script de test

---

**Bon! Vous devriez maintenant avoir des emails qui s'envoient. Si c'est toujours cassé, logi tous les `[EmailAPI]` en Vercel Logs.**
