<?php

namespace Database\Seeders;

use App\Models\Reference;
use Illuminate\Database\Seeder;

class BookSeeder extends Seeder
{
    public function run(): void
    {
        $this->command?->info('Importation des livres de secours...');

        $userId = \App\Models\Utilisateur::value('id');
        if (!$userId) {
            $this->command?->error('Aucun utilisateur trouvé. Exécutez d\'abord AdminSeeder.');
            return;
        }

        $books = $this->getBooks();
        $imported = 0;

        foreach ($books as $book) {
            $exists = Reference::where('titre', $book['titre'])
                ->where('auteur', $book['auteur'])
                ->exists();

            if ($exists) {
                continue;
            }

            Reference::create([
                'titre' => $book['titre'],
                'auteur' => $book['auteur'],
                'description' => $book['desc'],
                'type' => 'livre',
                'utilisateur_id' => $userId,
                'cover_image' => $book['cover'],
                'total_pages' => $book['pages'],
                'annee' => $book['annee'],
                'rating' => $book['note'],
                'is_featured' => rand(1, 100) <= 30,
                'date_creation' => now(),
            ]);

            $imported++;
        }

        $this->command?->info("{$imported} livres importés.");
    }

    private function getBooks(): array
    {
        return [
            ['titre' => 'Dune', 'auteur' => 'Frank Herbert', 'desc' => 'Paul Atreides, jeune noble destiné à régner sur la planète désertique Arrakis, se retrouve au cœur d\'un conflit galactique pour le contrôle de l\'Épice, la substance la plus précieuse de l\'univers.', 'cover' => 'https://covers.openlibrary.org/b/id/11153264-M.jpg', 'pages' => 688, 'annee' => 1965, 'note' => 4.7],
            ['titre' => 'Neuromancien', 'auteur' => 'William Gibson', 'desc' => 'Case, un hacker déchu, se voit offrir une dernière chance dans les méandres du cyberespace. Roman fondateur du mouvement cyberpunk.', 'cover' => 'https://covers.openlibrary.org/b/id/11082227-M.jpg', 'pages' => 320, 'annee' => 1984, 'note' => 4.3],
            ['titre' => 'Fondation', 'auteur' => 'Isaac Asimov', 'desc' => 'Le psychohistorien Hari Seldon prédit la chute de l\'Empire Galactique. Pour sauver le savoir de l\'humanité, il crée la Fondation.', 'cover' => 'https://covers.openlibrary.org/b/id/11058681-M.jpg', 'pages' => 256, 'annee' => 1951, 'note' => 4.5],
            ['titre' => '1984', 'auteur' => 'George Orwell', 'desc' => 'Dans un monde totalitaire où Big Brother vous regarde, Winston Smith tente de préserver son humanité et sa liberté de pensée.', 'cover' => 'https://covers.openlibrary.org/b/id/11083989-M.jpg', 'pages' => 328, 'annee' => 1949, 'note' => 4.6],
            ['titre' => 'Le Meilleur des Mondes', 'auteur' => 'Aldous Huxley', 'desc' => 'Dans une société où les humains sont conditionnés dès la naissance, un Sauvage élevé en dehors de ce système confronte les valeurs de ce monde parfait.', 'cover' => 'https://covers.openlibrary.org/b/id/11064535-M.jpg', 'pages' => 311, 'annee' => 1932, 'note' => 4.4],
            ['titre' => 'Ubik', 'auteur' => 'Philip K. Dick', 'desc' => 'Dans un monde où les morts peuvent être maintenus en semi-conscience, un groupe piégé dans une réalité qui se dégrade doit découvrir la vérité.', 'cover' => 'https://covers.openlibrary.org/b/id/11075312-M.jpg', 'pages' => 240, 'annee' => 1969, 'note' => 4.1],
            ['titre' => 'La Guerre des Mondes', 'auteur' => 'H.G. Wells', 'desc' => 'L\'Angleterre victorienne envahie par des Martiens aux machines de guerre terrifiantes. Un récit de survie qui a inspiré des générations.', 'cover' => 'https://covers.openlibrary.org/b/id/11072215-M.jpg', 'pages' => 240, 'annee' => 1898, 'note' => 4.0],
            ['titre' => 'Solaris', 'auteur' => 'Stanisław Lem', 'desc' => 'Sur une station orbitale au-dessus de l\'océan pensant Solaris, les souvenirs des visiteurs prennent vie de façon troublante.', 'cover' => 'https://covers.openlibrary.org/b/id/11085629-M.jpg', 'pages' => 288, 'annee' => 1961, 'note' => 4.3],
            ['titre' => 'Le Problème à trois corps', 'auteur' => 'Liu Cixin', 'desc' => 'Durant la Révolution Culturelle chinoise, un projet secret de communication avec les extraterrestres déclenche des événements menaçant l\'humanité.', 'cover' => 'https://covers.openlibrary.org/b/id/11083263-M.jpg', 'pages' => 416, 'annee' => 2008, 'note' => 4.4],
            ['titre' => 'Chroniques martiennes', 'auteur' => 'Ray Bradbury', 'desc' => 'Une série de nouvelles sur la colonisation de Mars par les humains et la rencontre avec les mystérieux Martiens.', 'cover' => 'https://covers.openlibrary.org/b/id/11072518-M.jpg', 'pages' => 224, 'annee' => 1950, 'note' => 4.2],
            ['titre' => 'Le Seigneur des Anneaux', 'auteur' => 'J.R.R. Tolkien', 'desc' => 'Frodon Sacquet hérite d\'un anneau aux pouvoirs maléfiques et entreprend un voyage périlleux pour le détruire dans les flammes de la Montagne du Destin.', 'cover' => 'https://covers.openlibrary.org/b/id/11085629-M.jpg', 'pages' => 1216, 'annee' => 1954, 'note' => 4.8],
            ['titre' => 'Harry Potter à l\'École des Sorciers', 'auteur' => 'J.K. Rowling', 'desc' => 'Le jour de ses onze ans, Harry Potter découvre qu\'il est un sorcier et intègre Poudlard, une école de magie où l\'attend un destin hors du commun.', 'cover' => 'https://covers.openlibrary.org/b/id/11085427-M.jpg', 'pages' => 332, 'annee' => 1997, 'note' => 4.8],
            ['titre' => 'Le Nom du Vent', 'auteur' => 'Patrick Rothfuss', 'desc' => 'Kvothe raconte sa vie extraordinaire, de ses années d\'enfance vagabonde à son entrée dans une prestigieuse école de magie.', 'cover' => 'https://covers.openlibrary.org/b/id/11085782-M.jpg', 'pages' => 736, 'annee' => 2007, 'note' => 4.6],
            ['titre' => 'Le Trône de Fer', 'auteur' => 'George R.R. Martin', 'desc' => 'Dans le royaume des Sept Couronnes, les grandes familles se disputent le pouvoir tandis qu\'un ancien ennemi se réveille au nord.', 'cover' => 'https://covers.openlibrary.org/b/id/11085629-M.jpg', 'pages' => 864, 'annee' => 1996, 'note' => 4.6],
            ['titre' => 'Bilbo le Hobbit', 'auteur' => 'J.R.R. Tolkien', 'desc' => 'Bilbo Sacquet, paisible hobbit, est entraîné par treize nains dans une quête pour reprendre un trésor volé par le dragon Smaug.', 'cover' => 'https://covers.openlibrary.org/b/id/11085629-M.jpg', 'pages' => 320, 'annee' => 1937, 'note' => 4.5],
            ['titre' => 'L\'Assassin Royal', 'auteur' => 'Robin Hobb', 'desc' => 'Fitz, bâtard princier, est formé comme assassin au service de la couronne. Il devra naviguer entre intrigues politiques et magie ancienne.', 'cover' => 'https://covers.openlibrary.org/b/id/11085629-M.jpg', 'pages' => 544, 'annee' => 1995, 'note' => 4.5],
            ['titre' => 'American Gods', 'auteur' => 'Neil Gaiman', 'desc' => 'Anciens dieux et nouvelles divinités modernes s\'affrontent dans l\'Amérique contemporaine. Un road-movie fantastique unique.', 'cover' => 'https://covers.openlibrary.org/b/id/11085629-M.jpg', 'pages' => 576, 'annee' => 2001, 'note' => 4.2],
            ['titre' => 'Eragon', 'auteur' => 'Christopher Paolini', 'desc' => 'Un jeune fermier découvre une pierre mystérieuse qui se révèle être un œuf de dragon. Il devient le dernier des Dragonniers.', 'cover' => 'https://covers.openlibrary.org/b/id/11085427-M.jpg', 'pages' => 544, 'annee' => 2003, 'note' => 4.0],
            ['titre' => 'Les Chroniques de Narnia', 'auteur' => 'C.S. Lewis', 'desc' => 'Quatre enfants découvrent un monde magique à travers une garde-robe enchantée et deviennent les souverains de Narnia.', 'cover' => 'https://covers.openlibrary.org/b/id/11085629-M.jpg', 'pages' => 256, 'annee' => 1950, 'note' => 4.3],
            ['titre' => 'La Passe-Miroir', 'auteur' => 'Christelle Dabos', 'desc' => 'Ophélie, une jeune femme discrète capable de traverser les miroirs, devient la fiancée d\'un mystérieux seigneur du Pôle.', 'cover' => 'https://covers.openlibrary.org/b/id/11085782-M.jpg', 'pages' => 544, 'annee' => 2013, 'note' => 4.4],
            ['titre' => 'Sapiens', 'auteur' => 'Yuval Noah Harari', 'desc' => 'Une brève histoire de l\'humanité, de la révolution cognitive à nos jours. Un best-seller mondial qui a changé notre regard sur l\'histoire.', 'cover' => 'https://covers.openlibrary.org/b/id/11085629-M.jpg', 'pages' => 480, 'annee' => 2011, 'note' => 4.6],
            ['titre' => 'Le Petit Prince', 'auteur' => 'Antoine de Saint-Exupéry', 'desc' => 'Un pilote échoué dans le désert rencontre un mystérieux petit prince venu d\'une autre planète qui lui raconte son voyage.', 'cover' => 'https://covers.openlibrary.org/b/id/11085629-M.jpg', 'pages' => 96, 'annee' => 1943, 'note' => 4.8],
            ['titre' => 'L\'Étranger', 'auteur' => 'Albert Camus', 'desc' => 'Meursault, un employé de bureau indifférent, commet un crime absurde sur une plage algérienne et confronte l\'absurdité du monde.', 'cover' => 'https://covers.openlibrary.org/b/id/11085629-M.jpg', 'pages' => 160, 'annee' => 1942, 'note' => 4.3],
            ['titre' => 'La Peste', 'auteur' => 'Albert Camus', 'desc' => 'La ville d\'Oran frappée par une épidémie de peste bouscule les certitudes et révèle le meilleur comme le pire de ses habitants.', 'cover' => 'https://covers.openlibrary.org/b/id/11085629-M.jpg', 'pages' => 320, 'annee' => 1947, 'note' => 4.4],
            ['titre' => 'Vingt mille lieues sous les mers', 'auteur' => 'Jules Verne', 'desc' => 'Le professeur Aronnax explore les abysses à bord du Nautilus du capitaine Nemo, vivant des aventures extraordinaires sous-marines.', 'cover' => 'https://covers.openlibrary.org/b/id/11085629-M.jpg', 'pages' => 384, 'annee' => 1870, 'note' => 4.2],
            ['titre' => 'Le Comte de Monte-Cristo', 'auteur' => 'Alexandre Dumas', 'desc' => 'Edmond Dantès, injustement emprisonné au château d\'If, s\'évade et met en place une vengeance implacable contre ses ennemis.', 'cover' => 'https://covers.openlibrary.org/b/id/11085629-M.jpg', 'pages' => 1312, 'annee' => 1844, 'note' => 4.7],
            ['titre' => 'L\'Art de la Guerre', 'auteur' => 'Sun Tzu', 'desc' => 'Traité de stratégie militaire antique dont les principes de guerre et de management restent d\'une étonnante pertinence aujourd\'hui.', 'cover' => 'https://covers.openlibrary.org/b/id/11085629-M.jpg', 'pages' => 100, 'annee' => -500, 'note' => 4.4],
            ['titre' => 'Pensées pour moi-même', 'auteur' => 'Marc Aurèle', 'desc' => 'Méditations intimes de l\'empereur romain stoïcien sur la vie, la mort, le devoir et la sagesse face à l\'adversité.', 'cover' => 'https://covers.openlibrary.org/b/id/11085629-M.jpg', 'pages' => 200, 'annee' => 180, 'note' => 4.5],
            ['titre' => 'Le Paradoxe du Choix', 'auteur' => 'Barry Schwartz', 'desc' => 'Pourquoi plus de choix rend moins heureux et comment y remédier. Une analyse fascinante de la psychologie de la décision.', 'cover' => 'https://covers.openlibrary.org/b/id/11085629-M.jpg', 'pages' => 288, 'annee' => 2004, 'note' => 4.0],
            ['titre' => 'Les Fleurs du Mal', 'auteur' => 'Charles Baudelaire', 'desc' => 'Recueil de poèmes qui explore les thèmes de la beauté, de la mort, de l\'amour et du mal à travers une écriture d\'une modernité radicale.', 'cover' => 'https://covers.openlibrary.org/b/id/11085629-M.jpg', 'pages' => 256, 'annee' => 1857, 'note' => 4.5],
        ];
    }
}
