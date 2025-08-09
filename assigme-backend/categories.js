// 📁 fichier : routes/categories.js

const express = require('express');
const router = express.Router();

// Liste des catégories et sous-catégories (statique pour l'instant)
const categoriesData = {
  "Alimentation & Boissons": ["Fruits", "Légumes", "Viandes", "Poissons", "Produits laitiers", "Épices", "Snacks", "Surgelés", "Bio", "Boissons"],
  "Électronique & Informatique": ["Smartphones", "Ordinateurs", "Tablettes", "Accessoires", "Télévisions", "Audio", "Appareils photo", "Drones"],
  "Mode & Vêtements": ["Hommes", "Femmes", "Enfants", "Chaussures", "Sacs", "Bijoux", "Montres", "Lunettes", "Sous-vêtements"],
  "Maison & Jardin": ["Meubles", "Décoration", "Linge de maison", "Outils", "Plantes", "Jardinage", "Éclairage", "Rangement"],
  "Beauté & Santé": ["Maquillage", "Soins de la peau", "Parfums", "Produits capillaires", "Hygiène", "Suppléments", "Matériel médical"],
  "Sport & Loisirs": ["Vêtements de sport", "Équipements", "Vélo", "Camping", "Fitness", "Jeux extérieurs", "Sports nautiques"],
  "Bébés & Enfants": ["Vêtements bébé", "Jouets", "Poussettes", "Sièges auto", "Alimentation bébé", "Hygiène bébé"],
  "Automobile & Moto": ["Pièces détachées", "Accessoires", "Pneus", "Huiles", "Produits d'entretien", "GPS", "Casques"],
  "Livres & Médias": ["Livres papier", "eBooks", "Magazines", "Films", "Musique", "Jeux vidéo", "Bandes dessinées"],
  "Animaux": ["Nourriture", "Accessoires", "Jouets", "Hygiène", "Habitat", "Vétérinaire", "Produits naturels"],
  "Bricolage & Matériaux": ["Peinture", "Bois", "Électricité", "Plomberie", "Outils", "Sécurité", "Isolation", "Quincaillerie"],
  "Services": ["Livraison", "Réparation", "Formation", "Abonnement", "Billetterie", "Coaching", "Traduction"],
  "Papeterie & Fournitures": ["Stylos", "Carnets", "Imprimantes", "Cartouches", "Fournitures scolaires", "Classeurs", "Accessoires de bureau"],
  "Jeux & Jouets": ["Jeux de société", "Jeux éducatifs", "Figurines", "Puzzles", "Jeux électroniques", "Peluches"],
  "Art & Artisanat": ["Peinture", "Dessin", "Sculpture", "Couture", "Matériaux créatifs", "DIY"],
  "Industrie & Pro": ["Équipements industriels", "Fournitures de bureau", "Matériel de santé", "Outils professionnels"],
  "Voyage & Bagagerie": ["Valises", "Sacs à dos", "Accessoires de voyage", "Adaptateurs", "Étiquettes", "Organisateurs"],
  "Énergie & Écologie": ["Panneaux solaires", "Batteries", "Lampes LED", "Composteurs", "Produits recyclés"],
  "Culture & Religion": ["Livres religieux", "Objets de culte", "Vêtements traditionnels", "Encens", "Calendriers liturgiques"],
  "Jeux d'argent & Loterie": ["Billets de loterie", "Cartes à gratter", "Jetons", "Accessoires de poker"],
  "Télécommunications": ["Cartes SIM", "Recharges", "Téléphones fixes", "Modems", "Routeurs"],
  "Immobilier & Construction": ["Matériaux", "Plans", "Outils", "Services de construction", "Location d'équipement"],
  "Éducation & Formation": ["Manuels", "Cours en ligne", "Matériel pédagogique", "Certifications", "Universités"]
};

// ➤ GET /api/categories : retourne la liste des catégories et leurs sous-catégories
router.get('/', (req, res) => {
  res.status(200).json(categoriesData);
});


module.exports = router;
