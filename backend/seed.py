"""
Seeds MongoDB Atlas with the sample products that shipped with the
original frontend (src/data/products.js), converted to the backend's
pricing model (originalPrice + offerPercentage -> discountAmount + finalPrice
computed by the same function the API uses).

Run once, after configuring backend/.env:

    python seed.py

Safe to re-run — it upserts by slug instead of duplicating.
"""
from datetime import datetime, timezone

from app.database import connect_to_mongo, get_db
from app.services.product_service import calculate_pricing, slugify

SAMPLE_PRODUCTS = [
    dict(title="Premium Wooden Name Plate", originalPrice=1799, price=1499,
         shortDescription="Elegant handcrafted wooden name plate for your entrance.",
         description="A premium handcrafted wooden name plate designed for a warm, timeless look at your doorstep. Cut from solid wood and finished by hand, each plate is sanded smooth and sealed for years of everyday use, indoors or under a covered porch.",
         category="Name Plates", material="Sheesham Wood", size="12 x 6 inch", finish="Matte Polish",
         availability="Available", badge="Best Seller", featured=True,
         tags=["wood", "entrance", "personalised", "home"],
         specifications={"Material": "Sheesham Wood", "Size": "12 x 6 inch", "Finish": "Matte Polish", "Usage": "Home Entrance", "Availability": "Available"},
         images=["https://picsum.photos/seed/sadvith-wood-plate-1/800/800", "https://picsum.photos/seed/sadvith-wood-plate-2/800/800", "https://picsum.photos/seed/sadvith-wood-plate-3/800/800"]),
    dict(title="Modern Acrylic Name Plate", originalPrice=1199, price=1199,
         shortDescription="Sleek frosted-acrylic plate with a floating-letter effect.",
         description="A contemporary frosted acrylic name plate with a subtle floating-letter effect, built for apartments and modern homes. The layered design catches the light without feeling flashy, and the acrylic body resists fading and moisture.",
         category="Name Plates", material="Acrylic", size="14 x 5 inch", finish="Frosted",
         availability="Available", badge="New", featured=True,
         tags=["acrylic", "modern", "entrance", "home"],
         specifications={"Material": "Acrylic", "Size": "14 x 5 inch", "Finish": "Frosted", "Usage": "Home Entrance", "Availability": "Available"},
         images=["https://picsum.photos/seed/sadvith-acrylic-plate-1/800/800", "https://picsum.photos/seed/sadvith-acrylic-plate-2/800/800"]),
    dict(title="Brushed Metal Office Plate", originalPrice=1299, price=999,
         shortDescription="Understated brushed-steel plate for desks and cabins.",
         description="An understated brushed-steel name plate built for office desks and cabin doors. The engraved lettering stays legible for years, and the weighted base keeps it in place on any desk surface.",
         category="Office", material="Stainless Steel", size="8 x 3 inch", finish="Brushed Steel",
         availability="Available", badge="Best Seller", featured=True,
         tags=["metal", "office", "desk"],
         specifications={"Material": "Stainless Steel", "Size": "8 x 3 inch", "Finish": "Brushed Steel", "Usage": "Office Desk", "Availability": "Available"},
         images=["https://picsum.photos/seed/sadvith-metal-plate-1/800/800", "https://picsum.photos/seed/sadvith-metal-plate-2/800/800", "https://picsum.photos/seed/sadvith-metal-plate-3/800/800"]),
    dict(title="Engraved Wooden Desk Plate", originalPrice=899, price=899,
         shortDescription="Warm walnut desk plate with deep-engraved lettering.",
         description="A warm walnut desk plate with deep-engraved lettering that keeps its detail even after years of handling. Pairs well with the Brushed Metal Office Plate for a coordinated cabin.",
         category="Office", material="Walnut Wood", size="8 x 3 inch", finish="Satin Polish",
         availability="Available", badge="", featured=False,
         tags=["wood", "office", "desk"],
         specifications={"Material": "Walnut Wood", "Size": "8 x 3 inch", "Finish": "Satin Polish", "Usage": "Office Desk", "Availability": "Available"},
         images=["https://picsum.photos/seed/sadvith-desk-plate-1/800/800", "https://picsum.photos/seed/sadvith-desk-plate-2/800/800"]),
    dict(title="Hand-Painted Ceramic Planter", originalPrice=999, price=799,
         shortDescription="Small-batch ceramic planter with a hand-painted rim.",
         description="A small-batch ceramic planter with a hand-painted rim, made for windowsills and balcony corners. Each piece has slight variations in the glaze, which is part of the handmade charm.",
         category="Home", material="Ceramic", size="6 x 6 inch", finish="Glazed",
         availability="Available", badge="Featured", featured=True,
         tags=["ceramic", "home", "decor", "planter"],
         specifications={"Material": "Ceramic", "Size": "6 x 6 inch", "Finish": "Glazed", "Usage": "Home Decor", "Availability": "Available"},
         images=["https://picsum.photos/seed/sadvith-planter-1/800/800", "https://picsum.photos/seed/sadvith-planter-2/800/800", "https://picsum.photos/seed/sadvith-planter-3/800/800"]),
    dict(title="Layered Wood Wall Clock", originalPrice=2299, price=1899,
         shortDescription="Minimal layered-wood clock with a silent sweep motion.",
         description="A minimal wall clock built from layered wood discs, finished with a silent sweep motion so it never ticks. A quiet, well-made addition to a living room or study.",
         category="Home", material="Wood", size="10 inch diameter", finish="Natural",
         availability="Available", badge="Limited", featured=False,
         tags=["wood", "home", "decor", "clock"],
         specifications={"Material": "Wood", "Size": "10 inch diameter", "Finish": "Natural", "Usage": "Home Decor", "Availability": "Available"},
         images=["https://picsum.photos/seed/sadvith-clock-1/800/800", "https://picsum.photos/seed/sadvith-clock-2/800/800"]),
    dict(title="Custom Family Name Plate", originalPrice=1999, price=1699,
         shortDescription="Two-tone wood-and-acrylic plate for family homes.",
         description="A two-tone name plate that pairs a solid wood base with an acrylic name insert, built for family homes that want something a little more detailed than a single-material plate.",
         category="Name Plates", material="Wood & Acrylic", size="15 x 7 inch", finish="Two-Tone",
         availability="Available", badge="Best Seller", featured=False,
         tags=["wood", "acrylic", "entrance", "personalised", "home"],
         specifications={"Material": "Wood & Acrylic", "Size": "15 x 7 inch", "Finish": "Two-Tone", "Usage": "Home Entrance", "Availability": "Available"},
         images=["https://picsum.photos/seed/sadvith-family-plate-1/800/800", "https://picsum.photos/seed/sadvith-family-plate-2/800/800", "https://picsum.photos/seed/sadvith-family-plate-3/800/800"]),
    dict(title="Brass Inlay Name Plate", originalPrice=1999, price=1999,
         shortDescription="Dark wood plate with an inlaid brass nameplate strip.",
         description="A dark wood name plate with an inlaid brass strip that develops a gentle patina over time. A traditional look for entrances that want a bit of weight and shine.",
         category="Name Plates", material="Wood & Brass", size="13 x 6 inch", finish="Antique Brass",
         availability="Made to Order", badge="Custom", featured=False,
         tags=["wood", "brass", "entrance", "home"],
         specifications={"Material": "Wood & Brass", "Size": "13 x 6 inch", "Finish": "Antique Brass", "Usage": "Home Entrance", "Availability": "Available"},
         images=["https://picsum.photos/seed/sadvith-brass-plate-1/800/800"]),
]


def offer_percentage_for(original_price: float, price: float) -> float:
    if not original_price or original_price <= price:
        return 0
    return round((original_price - price) / original_price * 100)


def run():
    connect_to_mongo()
    db = get_db()
    now = datetime.now(timezone.utc)
    created, updated = 0, 0

    for item in SAMPLE_PRODUCTS:
        offer_pct = offer_percentage_for(item["originalPrice"], item["price"])
        pricing = calculate_pricing(item["originalPrice"], offer_pct)
        slug = slugify(item["title"])

        doc = {
            "title": item["title"],
            "slug": slug,
            "shortDescription": item["shortDescription"],
            "description": item["description"],
            **pricing,
            "category": item["category"],
            "material": item["material"],
            "size": item["size"],
            "finish": item["finish"],
            "availability": item["availability"],
            "badge": item["badge"],
            "featured": item["featured"],
            "tags": item["tags"],
            "specifications": item["specifications"],
            "images": [{"url": url, "publicId": None} for url in item["images"]],
            "updatedAt": now,
        }

        existing = db.products.find_one({"slug": slug})
        if existing:
            db.products.update_one({"_id": existing["_id"]}, {"$set": doc})
            updated += 1
        else:
            doc["createdAt"] = now
            db.products.insert_one(doc)
            created += 1

    print(f"Seed complete. Created {created}, updated {updated} products.")


if __name__ == "__main__":
    run()
