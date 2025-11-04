import 'dotenv/config';
import { sql } from '@vercel/postgres';

const ANIME_DATA = [
    {
      id: "1",
      title: "Attack on Titan",
      description: "In a world where humanity resides within enormous walls, giant humanoid Titans prey on them. The story follows Eren Yeager, who vows to exterminate the Titans after they bring about the destruction of his hometown.",
      imageUrl: "https://picsum.photos/seed/aot/400/600",
      tags: ["Action", "Drama", "Fantasy", "Thriller"]
    },
    {
      id: "2",
      title: "Your Lie in April",
      description: "A piano prodigy who lost his ability to play after a traumatic event is drawn back into the world of music by a free-spirited violinist.",
      imageUrl: "https://picsum.photos/seed/ylia/400/600",
      tags: ["Drama", "Romance", "Slice of Life"]
    },
    {
      id: "3",
      title: "Steins;Gate",
      description: "A group of friends who have customized their microwave into a device that can send text messages to the past.",
      imageUrl: "https://picsum.photos/seed/sg/400/600",
      tags: ["Sci-Fi", "Thriller", "Drama"]
    },
    {
      id: "4",
      title: "Fullmetal Alchemist: Brotherhood",
      description: "Two brothers search for the Philosopher's Stone after an attempt to revive their deceased mother goes awry and leaves them in damaged physical forms.",
      imageUrl: "https://picsum.photos/seed/fmab/400/600",
      tags: ["Action", "Adventure", "Fantasy", "Drama"]
    },
    {
      id: "5",
      title: "K-On!",
      description: "A group of high school girls form a light music club. The story follows their daily lives, practices, and performances.",
      imageUrl: "https://picsum.photos/seed/kon/400/600",
      tags: ["Comedy", "Slice of Life"]
    },
    {
      id: "6",
      title: "Death Note",
      description: "A high school student discovers a supernatural notebook that allows him to kill anyone by writing their name in it.",
      imageUrl: "https://picsum.photos/seed/dn/400/600",
      tags: ["Supernatural", "Thriller", "Drama"]
    },
    {
      id: "7",
      title: "Jujutsu Kaisen",
      description: "A high school student joins a secret organization of Jujutsu Sorcerers in order to kill a powerful Curse named Ryomen Sukuna, of whom he becomes the host.",
      imageUrl: "https://picsum.photos/seed/jjk/400/600",
      tags: ["Action", "Supernatural", "Fantasy"]
    },
    {
      id: "8",
      title: "Mushishi",
      description: "Ginko, a \"Mushi Master,\" travels to investigate and help people who are afflicted by supernatural creatures called Mushi.",
      imageUrl: "https://picsum.photos/seed/mushi/400/600",
      tags: ["Slice of Life", "Supernatural", "Fantasy", "Drama"]
    },
    {
      id: "9",
      title: "One Punch Man",
      description: "The story of Saitama, a hero who can defeat any opponent with a single punch but seeks to find a worthy opponent after growing bored by a lack of challenge in his fight against evil.",
      imageUrl: "https://picsum.photos/seed/opm/400/600",
      tags: ["Action", "Comedy", "Sci-Fi"]
    },
    {
      id: "10",
      title: "Spy x Family",
      description: "A spy has to \"build a family\" to execute a mission, not realizing that the girl he adopts as a daughter and the woman he agrees to be in a fake marriage with are a mind reader and an assassin respectively.",
      imageUrl: "https://picsum.photos/seed/sxf/400/600",
      tags: ["Action", "Comedy", "Slice of Life"]
    }
];

async function createTables() {
    console.log('Creating tables...');
    await sql`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            is_admin BOOLEAN DEFAULT FALSE
        );
    `;
    console.log('Created "users" table');

    await sql`
        CREATE TABLE IF NOT EXISTS anime (
            id TEXT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            image_url VARCHAR(255),
            tags TEXT
        );
    `;
    console.log('Created "anime" table');

    await sql`
        CREATE TABLE IF NOT EXISTS ratings (
            user_id TEXT REFERENCES users(id),
            anime_id TEXT REFERENCES anime(id),
            score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
            PRIMARY KEY (user_id, anime_id)
        );
    `;
    console.log('Created "ratings" table');
    
    await sql`
        CREATE TABLE IF NOT EXISTS watchlists (
            user_id TEXT REFERENCES users(id),
            anime_id TEXT REFERENCES anime(id),
            status INTEGER NOT NULL,
            PRIMARY KEY (user_id, anime_id)
        );
    `;
    console.log('Created "watchlists" table');
}

async function seedData() {
    console.log('Seeding initial data...');
    
    // Seed Admin User
    console.log('Seeding admin user...');
    await sql`
        INSERT INTO users (id, username, password, is_admin)
        VALUES ('admin-user', 'admin', 'password', TRUE)
        ON CONFLICT (id) DO NOTHING;
    `;

    // Seed Anime
    console.log(`Seeding ${ANIME_DATA.length} anime...`);
    for (const anime of ANIME_DATA) {
        await sql`
            INSERT INTO anime (id, title, description, image_url, tags)
            VALUES (${anime.id}, ${anime.title}, ${anime.description}, ${anime.imageUrl}, ${anime.tags.join(',')})
            ON CONFLICT (id) DO NOTHING;
        `;
    }
}

async function main() {
    if (!process.env.POSTGRES_URL) {
        console.error('Missing POSTGRES_URL environment variable.');
        process.exit(1); // Exit with an error code
    }
    
    try {
        await createTables();
        await seedData();
        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('An error occurred while seeding the database:', error);
        process.exit(1); // Exit with an error code
    }
}

main();
