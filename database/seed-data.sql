-- =====================================================
-- BARRELVERSE SEED DATA
-- Spirits, Trivia Questions, and Initial Data
-- =====================================================

-- =====================================================
-- SPIRITS DATA (30+ Real Spirits)
-- =====================================================

INSERT INTO bv_spirits (name, brand, category, country, region, distillery, proof, abv, age_statement, rarity, description, tasting_notes, msrp) VALUES

-- BOURBON
('Pappy Van Winkle 23 Year', 'Van Winkle', 'bourbon', 'USA', 'Kentucky', 'Buffalo Trace', 95.6, 47.8, '23 years', 'legendary', 'The most sought-after bourbon in the world, aged for over two decades.', '["caramel", "oak", "vanilla", "leather", "tobacco"]', 299.99),
('Buffalo Trace', 'Buffalo Trace', 'bourbon', 'USA', 'Kentucky', 'Buffalo Trace', 90, 45, NULL, 'common', 'A well-balanced, easy-drinking bourbon perfect for any occasion.', '["vanilla", "caramel", "mint", "molasses"]', 29.99),
('Blanton''s Single Barrel', 'Blanton''s', 'bourbon', 'USA', 'Kentucky', 'Buffalo Trace', 93, 46.5, NULL, 'rare', 'The world''s first commercial single barrel bourbon.', '["honey", "vanilla", "citrus", "oak"]', 64.99),
('Maker''s Mark', 'Maker''s Mark', 'bourbon', 'USA', 'Kentucky', 'Maker''s Mark', 90, 45, NULL, 'common', 'Hand-dipped in red wax, made with soft red winter wheat.', '["caramel", "vanilla", "fruit", "wheat"]', 28.99),
('Woodford Reserve', 'Woodford Reserve', 'bourbon', 'USA', 'Kentucky', 'Woodford Reserve', 90.4, 45.2, NULL, 'common', 'A premium small batch bourbon with rich, complex flavor.', '["dried fruit", "vanilla", "cinnamon", "cocoa"]', 34.99),
('Eagle Rare 10 Year', 'Eagle Rare', 'bourbon', 'USA', 'Kentucky', 'Buffalo Trace', 90, 45, '10 years', 'uncommon', 'A decade-aged single barrel bourbon with bold character.', '["toffee", "oak", "honey", "leather"]', 39.99),
('Four Roses Single Barrel', 'Four Roses', 'bourbon', 'USA', 'Kentucky', 'Four Roses', 100, 50, NULL, 'uncommon', 'Complex and full-bodied single barrel expression.', '["spice", "ripe plum", "cherry", "vanilla"]', 44.99),
('Wild Turkey 101', 'Wild Turkey', 'bourbon', 'USA', 'Kentucky', 'Wild Turkey', 101, 50.5, NULL, 'common', 'Bold, spicy, and classic Kentucky bourbon.', '["vanilla", "caramel", "honey", "orange peel"]', 24.99),

-- SCOTCH
('Macallan 18 Year Sherry Oak', 'The Macallan', 'scotch', 'Scotland', 'Speyside', 'The Macallan', 86, 43, '18 years', 'ultra_rare', 'Aged exclusively in sherry-seasoned oak casks from Spain.', '["dried fruits", "spice", "orange", "chocolate"]', 329.99),
('Glenfiddich 12 Year', 'Glenfiddich', 'scotch', 'Scotland', 'Speyside', 'Glenfiddich', 80, 40, '12 years', 'common', 'The world''s most awarded single malt Scotch whisky.', '["pear", "oak", "butterscotch"]', 44.99),
('Lagavulin 16 Year', 'Lagavulin', 'scotch', 'Scotland', 'Islay', 'Lagavulin', 86, 43, '16 years', 'rare', 'Intensely smoky and peaty with a dry, long finish.', '["peat smoke", "seaweed", "dried fruit", "wood"]', 89.99),
('Laphroaig 10 Year', 'Laphroaig', 'scotch', 'Scotland', 'Islay', 'Laphroaig', 86, 43, '10 years', 'uncommon', 'Bold, smoky, and undeniably Islay character.', '["peat", "seaweed", "iodine", "vanilla"]', 49.99),
('Balvenie DoubleWood 12 Year', 'The Balvenie', 'scotch', 'Scotland', 'Speyside', 'The Balvenie', 86, 43, '12 years', 'uncommon', 'Finished in sherry casks for extra depth.', '["honey", "vanilla", "sherry", "cinnamon"]', 64.99),

-- IRISH
('Redbreast 12 Year', 'Redbreast', 'irish', 'Ireland', NULL, 'Midleton', 80, 40, '12 years', 'uncommon', 'The definitive Irish pot still whiskey.', '["sherry", "nuts", "spice", "fruit"]', 64.99),
('Jameson', 'Jameson', 'irish', 'Ireland', NULL, 'Midleton', 80, 40, NULL, 'common', 'Triple distilled for exceptional smoothness.', '["vanilla", "toasted wood", "sherry"]', 29.99),
('Green Spot', 'Green Spot', 'irish', 'Ireland', NULL, 'Midleton', 80, 40, NULL, 'rare', 'A classic single pot still Irish whiskey.', '["apple", "honey", "clove", "toasted oak"]', 59.99),

-- JAPANESE
('Yamazaki 18 Year', 'Yamazaki', 'japanese', 'Japan', NULL, 'Yamazaki', 86, 43, '18 years', 'legendary', 'Japan''s first and oldest malt whisky distillery.', '["dried fruit", "incense", "dark chocolate", "orange peel"]', 499.99),
('Hibiki Harmony', 'Hibiki', 'japanese', 'Japan', NULL, 'Suntory', 86, 43, NULL, 'rare', 'A harmonious blend of malt and grain whiskies.', '["honey", "orange peel", "white chocolate", "subtle smoke"]', 89.99),
('Nikka Coffey Grain', 'Nikka', 'japanese', 'Japan', NULL, 'Nikka', 90, 45, NULL, 'uncommon', 'Made using traditional Coffey stills.', '["vanilla", "corn", "citrus", "caramel"]', 69.99),

-- TEQUILA
('Don Julio 1942', 'Don Julio', 'tequila', 'Mexico', 'Jalisco', 'Don Julio', 80, 40, NULL, 'ultra_rare', 'Aged for a minimum of two and a half years.', '["caramel", "vanilla", "warm oak", "roasted agave"]', 169.99),
('Clase Azul Reposado', 'Clase Azul', 'tequila', 'Mexico', 'Jalisco', 'Clase Azul', 80, 40, NULL, 'rare', 'Rested in oak barrels for eight months.', '["vanilla", "honey", "agave", "cinnamon"]', 159.99),
('Patron Silver', 'Patron', 'tequila', 'Mexico', 'Jalisco', 'Patron', 80, 40, NULL, 'common', 'Smooth, soft, and easily mixable.', '["citrus", "pepper", "agave", "fruit"]', 44.99),

-- RUM
('Ron Zacapa 23', 'Ron Zacapa', 'rum', 'Guatemala', NULL, 'Ron Zacapa', 80, 40, NULL, 'rare', 'Aged using the solera system in the highlands of Guatemala.', '["honey", "butterscotch", "ginger", "oak"]', 54.99),
('Diplomatico Reserva Exclusiva', 'Diplomatico', 'rum', 'Venezuela', NULL, 'Diplomatico', 80, 40, NULL, 'uncommon', 'A rich and complex aged rum.', '["toffee", "orange peel", "cocoa", "vanilla"]', 42.99),

-- GIN
('Hendrick''s', 'Hendrick''s', 'gin', 'Scotland', NULL, 'Hendrick''s', 88, 44, NULL, 'common', 'Infused with cucumber and rose petals.', '["cucumber", "rose", "citrus", "juniper"]', 34.99),
('Tanqueray No. Ten', 'Tanqueray', 'gin', 'England', NULL, 'Tanqueray', 94.6, 47.3, NULL, 'uncommon', 'Made with fresh citrus fruits.', '["grapefruit", "orange", "lime", "juniper"]', 36.99),

-- COGNAC
('Hennessy XO', 'Hennessy', 'cognac', 'France', 'Cognac', 'Hennessy', 80, 40, NULL, 'ultra_rare', 'A bold and spicy Extra Old Cognac.', '["candied fruit", "chocolate", "vanilla", "oak"]', 199.99),
('Remy Martin VSOP', 'Remy Martin', 'cognac', 'France', 'Cognac', 'Remy Martin', 80, 40, NULL, 'uncommon', 'Smooth and mellow with a long finish.', '["vanilla", "apricot", "licorice", "oak"]', 54.99);

-- =====================================================
-- TRIVIA QUESTIONS (100+ Questions)
-- =====================================================

-- BOURBON QUESTIONS
INSERT INTO bv_trivia_questions (category, difficulty, question, correct_answer, wrong_answers, proof_reward, explanation) VALUES
('bourbon', 'easy', 'What percentage of the world''s bourbon is produced in Kentucky?', '95%', '["75%", "85%", "99%"]', 10, 'Kentucky produces approximately 95% of all bourbon in the world.'),
('bourbon', 'easy', 'What is the minimum corn content required for bourbon?', '51%', '["40%", "60%", "75%"]', 10, 'By law, bourbon must be made from a grain mixture that is at least 51% corn.'),
('bourbon', 'easy', 'What type of barrel must bourbon be aged in?', 'New charred oak', '["Used oak", "Steel", "Any wood"]', 10, 'Bourbon must be aged in new, charred oak barrels.'),
('bourbon', 'medium', 'Which distillery produces Pappy Van Winkle?', 'Buffalo Trace', '["Maker''s Mark", "Wild Turkey", "Jim Beam"]', 15, 'Pappy Van Winkle is produced at Buffalo Trace Distillery in Frankfort, Kentucky.'),
('bourbon', 'medium', 'What year was bourbon recognized as a distinctive product of the United States?', '1964', '["1950", "1975", "1932"]', 15, 'Congress declared bourbon a distinctive product of the United States in 1964.'),
('bourbon', 'medium', 'What does the term "small batch" typically mean?', 'Blend of select barrels', '["Single barrel", "Less than 10 years", "Under 100 proof"]', 15, 'Small batch usually refers to bourbon blended from a limited selection of barrels.'),
('bourbon', 'hard', 'What is the "angel''s share"?', 'Bourbon lost to evaporation', '["First pour from barrel", "Distiller''s sample", "Leftover mash"]', 20, 'The angel''s share is the portion of bourbon that evaporates from the barrel during aging.'),
('bourbon', 'hard', 'What is the maximum proof bourbon can be distilled to?', '160 proof', '["140 proof", "180 proof", "200 proof"]', 20, 'By law, bourbon cannot be distilled to more than 160 proof (80% ABV).'),
('bourbon', 'expert', 'What is the Lincoln County Process?', 'Charcoal filtering used for Tennessee whiskey', '["Kentucky aging requirement", "Corn fermentation method", "Barrel char level"]', 25, 'The Lincoln County Process involves filtering whiskey through charcoal, distinguishing Tennessee whiskey from bourbon.'),

-- SCOTCH QUESTIONS
('scotch', 'easy', 'What country produces Scotch whisky?', 'Scotland', '["Ireland", "England", "Wales"]', 10, 'By law, Scotch whisky must be produced in Scotland.'),
('scotch', 'easy', 'What is the minimum aging requirement for Scotch?', '3 years', '["2 years", "5 years", "7 years"]', 10, 'Scotch must be aged for a minimum of three years.'),
('scotch', 'easy', 'What grain is primarily used in single malt Scotch?', 'Malted barley', '["Corn", "Rye", "Wheat"]', 10, 'Single malt Scotch is made exclusively from malted barley.'),
('scotch', 'medium', 'Which Scotch region is known for peaty, smoky whiskies?', 'Islay', '["Speyside", "Highland", "Lowland"]', 15, 'Islay is famous for its intensely peaty and smoky single malts.'),
('scotch', 'medium', 'What does "single malt" mean?', 'From one distillery using malted barley', '["One barrel", "One year old", "Single ingredient"]', 15, 'Single malt means the whisky comes from a single distillery and uses only malted barley.'),
('scotch', 'medium', 'What is the purpose of peating malt?', 'To add smoky flavor', '["Speed up fermentation", "Increase alcohol", "Preserve the grain"]', 15, 'Peating adds distinctive smoky flavors to the whisky during the malting process.'),
('scotch', 'hard', 'What is the "cut" in whisky production?', 'Selection of the heart of the distillation', '["Opening the barrel", "Blending whiskies", "Adding water"]', 20, 'The cut refers to selecting the heart (middle) portion of the distillation.'),
('scotch', 'hard', 'How many official Scotch whisky regions are there?', '5', '["3", "6", "8"]', 20, 'There are 5 official Scotch whisky regions: Highland, Lowland, Speyside, Islay, and Campbeltown.'),
('scotch', 'expert', 'What does a whisky''s PPM measurement indicate?', 'Phenol parts per million (peatiness)', '["Proof percentage", "Production month", "Particle content"]', 25, 'PPM measures the phenol content, indicating how peaty a whisky is.'),

-- IRISH QUESTIONS
('irish', 'easy', 'How many times is Irish whiskey typically distilled?', 'Three times', '["Once", "Twice", "Four times"]', 10, 'Irish whiskey is traditionally triple distilled for smoothness.'),
('irish', 'easy', 'What is the most famous Irish whiskey brand?', 'Jameson', '["Jack Daniels", "Johnny Walker", "Jim Beam"]', 10, 'Jameson is the best-selling Irish whiskey in the world.'),
('irish', 'medium', 'What is pot still Irish whiskey?', 'Made with malted and unmalted barley', '["Made in copper pots", "Made with potatoes", "Made in small batches"]', 15, 'Single pot still Irish whiskey uses a mix of malted and unmalted barley, unique to Ireland.'),
('irish', 'medium', 'What makes Irish whiskey different from Scotch spelling?', 'Irish uses "whiskey" with an "e"', '["Color", "Age", "Barrel type"]', 15, 'Irish whiskey is spelled with an "e", while Scotch is "whisky" without the "e".'),
('irish', 'hard', 'What is the minimum aging for Irish whiskey?', '3 years', '["2 years", "5 years", "No minimum"]', 20, 'Like Scotch, Irish whiskey must be aged for at least 3 years.'),

-- JAPANESE QUESTIONS
('japanese', 'easy', 'When did whisky production begin in Japan?', '1920s', '["1800s", "1950s", "1980s"]', 10, 'Japanese whisky production began in the early 1920s, influenced by Scotch traditions.'),
('japanese', 'easy', 'What company founded Japan''s first whisky distillery?', 'Suntory', '["Nikka", "Kirin", "Asahi"]', 10, 'Suntory founded Yamazaki, Japan''s first whisky distillery, in 1923.'),
('japanese', 'medium', 'What is Mizuwari?', 'Whisky with water and ice', '["Neat whisky", "Whisky cocktail", "Hot whisky"]', 15, 'Mizuwari is a popular Japanese way of drinking whisky with water and ice.'),
('japanese', 'medium', 'Who is known as the father of Japanese whisky?', 'Masataka Taketsuru', '["Shinjiro Torii", "Ichiro Akuto", "Keizo Saji"]', 15, 'Masataka Taketsuru studied in Scotland and founded Nikka Whisky.'),
('japanese', 'hard', 'What unique wood does Japan use for some barrels?', 'Mizunara oak', '["Cedar", "Cherry", "Bamboo"]', 20, 'Mizunara (Japanese oak) gives unique sandalwood and incense notes.'),

-- TEQUILA QUESTIONS
('tequila', 'easy', 'What plant is tequila made from?', 'Blue agave', '["Corn", "Cactus", "Sugar cane"]', 10, 'Tequila must be made from blue weber agave plants.'),
('tequila', 'easy', 'What country must tequila be produced in?', 'Mexico', '["USA", "Spain", "Any country"]', 10, 'Like Champagne, tequila can only be produced in designated regions of Mexico.'),
('tequila', 'medium', 'What is the minimum aging for Añejo tequila?', '1 year', '["6 months", "2 years", "3 years"]', 15, 'Añejo tequila must be aged for at least one year in oak barrels.'),
('tequila', 'medium', 'What is the difference between tequila and mezcal?', 'Tequila uses only blue agave', '["Different countries", "No difference", "Mezcal is aged longer"]', 15, 'Tequila must use blue agave, while mezcal can use any type of agave.'),
('tequila', 'hard', 'What is a "Jimador"?', 'Agave harvester', '["Tequila taster", "Distillery owner", "Barrel maker"]', 20, 'A Jimador is a skilled worker who harvests agave plants.'),

-- RUM QUESTIONS
('rum', 'easy', 'What is rum made from?', 'Sugar cane or molasses', '["Grains", "Grapes", "Potatoes"]', 10, 'Rum is distilled from fermented sugar cane juice or molasses.'),
('rum', 'easy', 'What color is white rum?', 'Clear/colorless', '["Brown", "Gold", "Amber"]', 10, 'White (silver) rum is typically unaged or filtered to be clear.'),
('rum', 'medium', 'What Caribbean nation is famous for rum production?', 'Cuba', '["Brazil", "Chile", "Canada"]', 15, 'Cuba, Jamaica, and Puerto Rico are all famous for rum production.'),
('rum', 'medium', 'What is the solera aging system?', 'Fractional blending of different ages', '["Single barrel aging", "Outdoor aging", "Speed aging"]', 15, 'Solera involves blending rums of different ages in a tiered barrel system.'),
('rum', 'hard', 'What is "rhum agricole"?', 'Rum made from fresh cane juice', '["Aged rum", "Spiced rum", "Rum liqueur"]', 20, 'Rhum agricole is made from fresh sugar cane juice instead of molasses.'),

-- GIN QUESTIONS
('gin', 'easy', 'What is the defining botanical in gin?', 'Juniper berries', '["Cucumber", "Lemon", "Rose"]', 10, 'Juniper berries must be the predominant flavor in gin.'),
('gin', 'easy', 'What country is gin originally from?', 'Netherlands', '["England", "USA", "Germany"]', 10, 'Gin originated in the Netherlands before becoming popular in England.'),
('gin', 'medium', 'What does "London Dry" mean for gin?', 'A production method with no added flavors after distillation', '["Made in London", "No sugar", "Stronger taste"]', 15, 'London Dry refers to a dry style with no artificial flavoring after distillation.'),
('gin', 'medium', 'What is a "botanical" in gin production?', 'Plant ingredient added for flavor', '["Type of still", "Water source", "Fermentation yeast"]', 15, 'Botanicals are herbs, spices, and plants infused into gin for flavor.'),
('gin', 'hard', 'What is Old Tom gin?', 'A slightly sweetened style of gin', '["Aged gin", "Navy strength gin", "Fruit-flavored gin"]', 20, 'Old Tom is a slightly sweeter style of gin, popular in the 1800s.'),

-- COGNAC QUESTIONS
('cognac', 'easy', 'What is Cognac made from?', 'Grapes', '["Grain", "Apples", "Sugar cane"]', 10, 'Cognac is a grape-based brandy from the Cognac region of France.'),
('cognac', 'easy', 'What country does Cognac come from?', 'France', '["Italy", "Spain", "Germany"]', 10, 'Cognac must be produced in the Cognac region of France.'),
('cognac', 'medium', 'What does VS mean on a Cognac bottle?', 'Very Special (aged 2+ years)', '["Very Smooth", "Very Strong", "Vintage Select"]', 15, 'VS (Very Special) means the youngest eau-de-vie is aged at least 2 years.'),
('cognac', 'medium', 'What does XO stand for?', 'Extra Old', '["Extra Original", "Xtra Oaky", "Excellence Order"]', 15, 'XO (Extra Old) requires minimum 10 years aging (changed from 6 in 2018).'),
('cognac', 'hard', 'What grape variety is most used in Cognac?', 'Ugni Blanc', '["Chardonnay", "Merlot", "Pinot Noir"]', 20, 'Ugni Blanc (Trebbiano) is the primary grape variety used in Cognac production.'),

-- GENERAL QUESTIONS
('general', 'easy', 'What is the term for whiskey aged in used barrels?', 'Finished', '["Vintage", "Reserve", "Single barrel"]', 10, 'Finishing refers to secondary aging in different cask types.'),
('general', 'easy', 'What does "ABV" stand for?', 'Alcohol By Volume', '["Alcohol By Value", "American Barrel Vintage", "Aged Barrel Volume"]', 10, 'ABV measures the percentage of alcohol in a beverage.'),
('general', 'medium', 'What is "cask strength"?', 'Bottled directly from barrel without dilution', '["Stronger than proof", "Extra aged", "Mixed from multiple casks"]', 15, 'Cask strength means the whiskey is bottled at barrel proof without water dilution.'),
('general', 'medium', 'What is the difference between whiskey and whisky?', 'Regional spelling (e/no e)', '["Different grains", "Different aging", "Different proof"]', 15, 'Countries like Scotland and Canada use "whisky"; Ireland and USA use "whiskey".'),
('general', 'hard', 'What is a "dram"?', 'A serving of whisky', '["A type of barrel", "A distillation method", "A grain mixture"]', 20, 'A dram is a traditional Scottish term for a pour of whisky.'),

-- HISTORY QUESTIONS
('history', 'easy', 'In what century was whiskey invented?', '15th century', '["10th century", "18th century", "20th century"]', 10, 'The earliest records of whiskey distillation date to the 15th century.'),
('history', 'medium', 'What event led to the bourbon boom of the 1700s?', 'Whiskey Rebellion', '["Civil War", "World War I", "Prohibition"]', 15, 'The Whiskey Rebellion of 1794 pushed distillers west to Kentucky.'),
('history', 'hard', 'When did Prohibition end in the United States?', '1933', '["1919", "1925", "1940"]', 20, 'Prohibition ended with the 21st Amendment in December 1933.'),

-- PRODUCTION QUESTIONS
('production', 'easy', 'What is the mash in whiskey production?', 'Ground grain mixed with water', '["Yeast mixture", "Distilled liquid", "Aged spirit"]', 10, 'The mash is a mixture of ground grains and hot water that starts fermentation.'),
('production', 'medium', 'What is a "wash" in distillation?', 'Fermented liquid before distillation', '["Cleaning solution", "Final product", "Barrel treatment"]', 15, 'The wash is the beer-like fermented liquid that gets distilled into spirit.'),
('production', 'hard', 'What temperature is whiskey typically distilled at?', '173°F (78°C)', '["150°F", "200°F", "212°F"]', 20, 'Alcohol evaporates around 173°F, which is lower than water''s boiling point.');

-- =====================================================
-- COURSES (Academy)
-- =====================================================

INSERT INTO bv_courses (title, description, category, difficulty, duration_minutes, proof_reward, lessons) VALUES
('Introduction to Bourbon', 'Learn the basics of America''s native spirit', 'bourbon', 'beginner', 30, 100, '[{"title": "What is Bourbon?", "content": "Learn the legal definition and history"}, {"title": "How Bourbon is Made", "content": "From grain to glass"}, {"title": "Tasting Your First Bourbon", "content": "How to properly taste and evaluate"}]'),
('Scotch Whisky 101', 'Discover the world of Scottish single malts', 'scotch', 'beginner', 45, 150, '[{"title": "The Scotch Regions", "content": "Understanding the 5 whisky regions"}, {"title": "Single Malt vs Blended", "content": "What makes each unique"}, {"title": "Peat and Smoke", "content": "Understanding Islay flavors"}]'),
('Advanced Bourbon Tasting', 'Develop your palate for premium bourbons', 'bourbon', 'advanced', 60, 200, '[{"title": "Identifying Flavor Notes", "content": "Train your nose and palate"}, {"title": "Evaluating Age Statements", "content": "How aging affects flavor"}, {"title": "Blind Tasting Techniques", "content": "Professional evaluation methods"}]');

-- =====================================================
-- REWARDS
-- =====================================================

INSERT INTO bv_rewards (name, description, category, proof_cost, is_active) VALUES
('BarrelVerse Sticker Pack', 'Set of 5 premium vinyl stickers', 'merchandise', 500, true),
('Digital Tasting Journal', 'Downloadable PDF tasting notebook', 'digital', 250, true),
('10% Off Partner Spirits', 'Discount code for partner retailers', 'discount', 1000, true),
('Virtual Distillery Tour', 'Live video tour of a craft distillery', 'experience', 2500, true),
('Limited Edition Profile Badge', 'Rare collector badge for your profile', 'digital', 750, true),
('Branded Glencairn Glass', 'Official BarrelVerse whisky glass', 'merchandise', 1500, true),
('Master Taster Certificate', 'Personalized PDF certificate', 'digital', 5000, true);

-- =====================================================
-- END OF SEED DATA
-- =====================================================
