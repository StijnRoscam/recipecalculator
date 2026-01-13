-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "color" TEXT
);

-- CreateTable
CREATE TABLE "source_materials" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category_id" TEXT,
    "current_price" REAL NOT NULL,
    "unit_of_measure" TEXT NOT NULL,
    "supplier" TEXT,
    "sku" TEXT,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "source_materials_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "recipes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category_id" TEXT,
    "yield_quantity" REAL NOT NULL,
    "yield_unit" TEXT NOT NULL,
    "prep_time_minutes" INTEGER,
    "instructions" TEXT,
    "profit_margin" REAL,
    "waste_percentage" REAL,
    "vat_percentage" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "recipes_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "recipe_ingredients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipe_id" TEXT NOT NULL,
    "material_id" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "notes" TEXT,
    CONSTRAINT "recipe_ingredients_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "recipe_ingredients_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "source_materials" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "packaging_materials" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "unit_price" REAL NOT NULL,
    "unit_type" TEXT NOT NULL,
    "supplier" TEXT,
    "sku" TEXT,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "is_archived" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "recipe_packaging" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recipe_id" TEXT NOT NULL,
    "packaging_material_id" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "notes" TEXT,
    CONSTRAINT "recipe_packaging_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "recipe_packaging_packaging_material_id_fkey" FOREIGN KEY ("packaging_material_id") REFERENCES "packaging_materials" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "setting_type" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "price_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "material_id" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "effective_date" DATETIME NOT NULL,
    "notes" TEXT,
    CONSTRAINT "price_history_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "source_materials" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "categories_type_idx" ON "categories"("type");

-- CreateIndex
CREATE UNIQUE INDEX "source_materials_name_key" ON "source_materials"("name");

-- CreateIndex
CREATE INDEX "source_materials_name_idx" ON "source_materials"("name");

-- CreateIndex
CREATE INDEX "source_materials_category_id_idx" ON "source_materials"("category_id");

-- CreateIndex
CREATE INDEX "source_materials_is_archived_idx" ON "source_materials"("is_archived");

-- CreateIndex
CREATE UNIQUE INDEX "recipes_name_key" ON "recipes"("name");

-- CreateIndex
CREATE INDEX "recipes_name_idx" ON "recipes"("name");

-- CreateIndex
CREATE INDEX "recipes_category_id_idx" ON "recipes"("category_id");

-- CreateIndex
CREATE INDEX "recipes_is_archived_idx" ON "recipes"("is_archived");

-- CreateIndex
CREATE INDEX "recipes_is_favorite_idx" ON "recipes"("is_favorite");

-- CreateIndex
CREATE INDEX "recipe_ingredients_recipe_id_idx" ON "recipe_ingredients"("recipe_id");

-- CreateIndex
CREATE INDEX "recipe_ingredients_material_id_idx" ON "recipe_ingredients"("material_id");

-- CreateIndex
CREATE INDEX "recipe_ingredients_recipe_id_sort_order_idx" ON "recipe_ingredients"("recipe_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_ingredients_recipe_id_material_id_key" ON "recipe_ingredients"("recipe_id", "material_id");

-- CreateIndex
CREATE UNIQUE INDEX "packaging_materials_name_key" ON "packaging_materials"("name");

-- CreateIndex
CREATE INDEX "packaging_materials_name_idx" ON "packaging_materials"("name");

-- CreateIndex
CREATE INDEX "packaging_materials_is_archived_idx" ON "packaging_materials"("is_archived");

-- CreateIndex
CREATE INDEX "recipe_packaging_recipe_id_idx" ON "recipe_packaging"("recipe_id");

-- CreateIndex
CREATE INDEX "recipe_packaging_packaging_material_id_idx" ON "recipe_packaging"("packaging_material_id");

-- CreateIndex
CREATE INDEX "recipe_packaging_recipe_id_sort_order_idx" ON "recipe_packaging"("recipe_id", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_packaging_recipe_id_packaging_material_id_key" ON "recipe_packaging"("recipe_id", "packaging_material_id");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- CreateIndex
CREATE INDEX "settings_key_idx" ON "settings"("key");

-- CreateIndex
CREATE INDEX "price_history_material_id_idx" ON "price_history"("material_id");

-- CreateIndex
CREATE INDEX "price_history_effective_date_idx" ON "price_history"("effective_date");

-- CreateIndex
CREATE INDEX "price_history_material_id_effective_date_idx" ON "price_history"("material_id", "effective_date" DESC);
