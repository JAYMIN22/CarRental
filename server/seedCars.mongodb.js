// Run with: mongosh "YOUR_MONGO_URI" --file seedCars.mongodb.js
// Or: mongosh, then: load("seedCars.mongodb.js")

const LOCATIONS = ["Mumbai","Delhi","Bangalore","Hyderabad","Ahmedabad","Chennai","Kolkata","Surat","Pune","Jaipur","Lucknow","Kanpur","Nagpur","Indore","Thane"];
const BRANDS = ["Toyota","Honda","Maruti","Hyundai","Tata","Mahindra","BMW","Mercedes","Ford","Kia","Volkswagen","Nissan","Renault","Jeep"];
const MODELS = ["Camry","Innova","Fortuner","City","Amaze","Swift","Baleno","Brezza","Creta","i20","Nexon","Harrier","XUV700","Scorpio","3 Series","X5","C-Class","EcoSport","Seltos","Sonet","Polo","Kicks","Duster","Compass"];
const CATEGORIES = ["Sedan","SUV","Van"];
const FUEL = ["Petrol","Diesel","Electric","Hybrid"];
const TRANS = ["Automatic","Manual","Semi-Automatic"];
const IMAGES = [
  "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800",
  "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800",
  "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800",
  "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800"
];

function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function r(min,max) { return Math.floor(Math.random()*(max-min+1))+min; }

const user = db.users.findOne({ email: "jaymin@gmail.com" });
if (!user) {
  print("User jaymin@gmail.com not found. Create the user first.");
  quit(1);
}

const ownerId = user._id;
const cars = [];

for (let i = 0; i < 50; i++) {
  const brand = pick(BRANDS);
  const model = pick(MODELS);
  cars.push({
    owner: ownerId,
    brand,
    model,
    image: pick(IMAGES),
    year: r(2018,2024),
    category: pick(CATEGORIES),
    seating_capacity: pick([4,5,6,7]),
    fuel_type: pick(FUEL),
    transmission: pick(TRANS),
    pricePerDay: r(80,500),
    location: pick(LOCATIONS),
    description: `Well-maintained ${brand} ${model} available for rent.`,
    isAvaliable: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

db.cars.insertMany(cars);
print("Inserted 50 cars for jaymin@gmail.com");
