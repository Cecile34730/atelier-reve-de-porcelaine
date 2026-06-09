🏺 Atelier Rêve de Porcelaine - Guide de Survie

"Parce que même quand le développeur n'est pas là, l'atelier continue de tourner !"

Développé avec ❤️ par MisterHur & Z.AI
© 2024 MisterHur et Z.AI - Tous droits réservés.
🌟 Introduction

Pas de panique ! Ce document est fait pour vous, Cécile. Si Alain n'est pas disponible, ce guide vous explique comment fonctionne votre outil de gestion, ce qu'il faut faire au quotidien, et comment réagir si quelque chose cloche.
1. L'Application (Au Quotidien)

C'est l'outil que vous utilisez tous les jours. Il y a deux types d'utilisateurs : Vous (Admin) et Les Élèves.
👑 Vous (L'Admin) - votresite.com/admin

     Onglet Élèves : Cliquez sur un élève pour voir sa fiche. Vous pouvez y ajouter des paiements, des créations (cuissons), modifier son forfait, ou lui envoyer un lien pour réinitialiser son mot de passe.
     Onglet Planning : Vous permet de générer toutes les séances de l'année (hors vacances). Si vous êtes absente, cliquez sur le bouton rouge "Prévenir d'absence" : un email sera envoyé automatiquement à tous les inscrits de cette séance.
     Onglet Bilan : Un résumé financier de l'année en cours (inscriptions, cuissons, argent encaissé, et ce qu'il vous est dû).

🎨 Les Élèves - votresite.com/dashboard

     Ils peuvent se créer un compte, choisir leur forfait, et réserver ou annuler leurs séances seuls.
     Mot de passe oublié ? Ils ont un lien "Mot de passe oublié" sur la page de connexion. Ils recevront un email pour le changer tout seuls. Vous n'avez normalement pas à intervenir !

2. Brevo (Le Facteur 📬)

C'est quoi ? C'est le service qui envoie les emails pour vous (les mots de passe oubliés et les notifications d'absence). Sans Brevo, plus aucun email ne part du site.

Où le trouver ? brevo.com

Que faire si les emails ne partent plus ?

    Connectez-vous à Brevo.
    Allez dans SMTP & API et vérifiez que votre clé API est toujours active.
    Allez dans Expéditeurs & IP : assurez-vous que votre adresse email professionnelle est bien vérifiée (elle doit être en vert). Si elle a expiré, cliquez sur la renvoyer.
    Note : Brevo offre 300 emails par jour gratuitement, ce qui est largement suffisant.

3. Vercel (La Maison du Site 🏠)

C'est quoi ? C'est l'hébergement. C'est l'endroit où "vit" votre site sur internet pour que tout le monde puisse y accéder.

Où le trouver ? vercel.com

Que faire si le site est tout blanc ou "En construction" ?

    Connectez-vous à Vercel.
    Cliquez sur votre projet.
    Allez dans l'onglet Deployments (Déploiements).
    Si vous voyez un cercle rouge ❌, c'est qu'il y a eu un bug lors d'une mise à jour. Cliquez sur les trois petits points ... à côté du dernier cercle vert ✅ et choisissez Redeploy (Redéployer). Cela relance le site comme un ordinateur qu'on redémarre.

4. Supabase (L'Armoire Forte 🔒)

C'est quoi ? C'est la base de données. C'est là que sont rangés les noms, les mots de passe (cryptés), les paiements et les réservations de tout le monde. 

Où le trouver ? supabase.com

⚠️ RÈGLE D'OR : Ne modifiez JAMAIS les données directement dans Supabase à la main, sauf en cas d'urgence absolue. 
L'application est conçue pour faire les calculs (comme le solde dû par l'élève) automatiquement. Si vous changez un chiffre dans Supabase, cela peut casser les calculs du site.

Quand y aller ?

     Un élève vous appelle car son compte est complètement bloqué et le bouton "Mot de passe oublié" ne marche pas. Vous pouvez aller dans Authentication > Users pour supprimer son compte et lui dire de se réinscrire.
     Sur conseil d'Alain, pour vérifier une erreur dans la table Table Editor.

5. GitHub (Le Plan de Construction 🏗️)

C'est quoi ? C'est l'endroit où est stocké le code source du site. C'est la recette de cuisine qui permet de fabriquer le site.

Où le trouver ? github.com (Dépôt : atelier-reve-de-porcelaine)

⚠️ RÈGLE D'OR : N'y touchez pas ! C'est le territoire du développeur. Modifier un fichier ici sans savoir coder cassera immédiatement le site lors de la prochaine mise à jour sur Vercel.
🆘 SOS : En cas de panique !

"Un élève m'appelle car il n'arrive pas à se connecter"
👉 Dites-lui de cliquer sur "Mot de passe oublié" sur la page de connexion. 99% des problèmes se règlent ainsi.

"Le site ne marche plus du tout sur mon ordinateur !"
👉 Essayez d'ouvrir le site sur votre téléphone ou une fenêtre de navigation privée. Si ça marche sur le téléphone, c'est que le cache de votre ordinateur est saturé. Videz l'historique/les cookies de votre navigateur.

"J'ai fait une erreur de paiement pour un élève"
👉 Pas de panique. Allez sur l'interface Admin, cliquez sur l'élève, et contactez Alain pour qu'il corrige l'historique via la base de données ou vous explique comment annuler l'entrée.

"Rien ne marche, je suis perdue !"
👉 Prenez une capture d'écran de ce qui bug et envoyez un message à Alain. Il pourra souvent régler le problème à distance en quelques minutes !

Bon courage !
