-- ============================================
-- SEED TEST ACCOUNTS
-- Creates 20 test accounts (test01@gmail.com → test20@gmail.com)
-- with complete profiles in both dating_profile_full and matrimony_profile_full
-- ============================================

-- IMPORTANT INSTRUCTIONS:
-- ============================================
-- 1. FIRST: Create auth users in Supabase Dashboard:
--    - Go to Authentication > Users > Add User
--    - Create users with emails: test01@gmail.com through test20@gmail.com
--    - Use any password (you can reset later)
--    - IMPORTANT: The script will automatically fetch user IDs from auth.users
--
-- 2. This script automatically fetches user IDs from auth.users based on email
--    - No need to manually replace UUIDs
--    - If a user is missing, you'll get a clear error message
--
-- 3. To verify users exist, run this query first:
--    SELECT id, email FROM auth.users WHERE email LIKE 'test%@gmail.com' ORDER BY email;
--
-- 4. All profiles include COMPLETE onboarding data:
--    - Dating: photo_prompts, prompts (6 answers), this_or_that_choices (4), relationship_goals
--    - Matrimony: All 7 steps completed (partner_preferences column not included - add it after running migration)
-- ============================================

-- ============================================
-- STEP 1: VERIFY AUTH USERS EXIST
-- ============================================
-- First, check if auth users exist. If not, create them or update the UUIDs below.
-- Run this query to see existing users:
-- SELECT id, email FROM auth.users WHERE email LIKE 'test%@gmail.com' ORDER BY email;

-- ============================================
-- STEP 2: GET USER IDs FROM AUTH.USERS
-- ============================================
-- This script will automatically fetch user IDs from auth.users based on email
DO $$
DECLARE
  -- Male users (test01-test10) - Auto-fetched from auth.users
  user_01 UUID;
  user_02 UUID;
  user_03 UUID;
  user_04 UUID;
  user_05 UUID;
  user_06 UUID;
  user_07 UUID;
  user_08 UUID;
  user_09 UUID;
  user_10 UUID;
  
  -- Female users (test11-test20) - Auto-fetched from auth.users
  user_11 UUID;
  user_12 UUID;
  user_13 UUID;
  user_14 UUID;
  user_15 UUID;
  user_16 UUID;
  user_17 UUID;
  user_18 UUID;
  user_19 UUID;
  user_20 UUID;
BEGIN
  -- Fetch user IDs from auth.users table
  SELECT id INTO user_01 FROM auth.users WHERE email = 'test01@gmail.com';
  SELECT id INTO user_02 FROM auth.users WHERE email = 'test02@gmail.com';
  SELECT id INTO user_03 FROM auth.users WHERE email = 'test03@gmail.com';
  SELECT id INTO user_04 FROM auth.users WHERE email = 'test04@gmail.com';
  SELECT id INTO user_05 FROM auth.users WHERE email = 'test05@gmail.com';
  SELECT id INTO user_06 FROM auth.users WHERE email = 'test06@gmail.com';
  SELECT id INTO user_07 FROM auth.users WHERE email = 'test07@gmail.com';
  SELECT id INTO user_08 FROM auth.users WHERE email = 'test08@gmail.com';
  SELECT id INTO user_09 FROM auth.users WHERE email = 'test09@gmail.com';
  SELECT id INTO user_10 FROM auth.users WHERE email = 'test10@gmail.com';
  SELECT id INTO user_11 FROM auth.users WHERE email = 'test11@gmail.com';
  SELECT id INTO user_12 FROM auth.users WHERE email = 'test12@gmail.com';
  SELECT id INTO user_13 FROM auth.users WHERE email = 'test13@gmail.com';
  SELECT id INTO user_14 FROM auth.users WHERE email = 'test14@gmail.com';
  SELECT id INTO user_15 FROM auth.users WHERE email = 'test15@gmail.com';
  SELECT id INTO user_16 FROM auth.users WHERE email = 'test16@gmail.com';
  SELECT id INTO user_17 FROM auth.users WHERE email = 'test17@gmail.com';
  SELECT id INTO user_18 FROM auth.users WHERE email = 'test18@gmail.com';
  SELECT id INTO user_19 FROM auth.users WHERE email = 'test19@gmail.com';
  SELECT id INTO user_20 FROM auth.users WHERE email = 'test20@gmail.com';

  -- Check if all users exist
  IF user_01 IS NULL OR user_02 IS NULL OR user_03 IS NULL OR user_04 IS NULL OR user_05 IS NULL OR
     user_06 IS NULL OR user_07 IS NULL OR user_08 IS NULL OR user_09 IS NULL OR user_10 IS NULL OR
     user_11 IS NULL OR user_12 IS NULL OR user_13 IS NULL OR user_14 IS NULL OR user_15 IS NULL OR
     user_16 IS NULL OR user_17 IS NULL OR user_18 IS NULL OR user_19 IS NULL OR user_20 IS NULL THEN
    RAISE EXCEPTION 'One or more auth users are missing. Please create all 20 users (test01@gmail.com through test20@gmail.com) in Authentication > Users first.';
  END IF;
  -- ============================================
  -- USER PROFILES (test01-test10: Male)
  -- ============================================
  INSERT INTO user_profiles (user_id, date_of_birth, gender, onboarding_dating, onboarding_matrimony, onboarding_completed, onboarding_completed_at)
  VALUES
    (user_01, '1995-01-15', 'male', true, true, true, NOW()),
    (user_02, '1996-02-20', 'male', true, true, true, NOW()),
    (user_03, '1997-03-25', 'male', true, true, true, NOW()),
    (user_04, '1998-04-10', 'male', true, true, true, NOW()),
    (user_05, '1999-05-15', 'male', true, true, true, NOW()),
    (user_06, '2000-06-20', 'male', true, true, true, NOW()),
    (user_07, '1994-07-25', 'male', true, true, true, NOW()),
    (user_08, '1993-08-10', 'male', true, true, true, NOW()),
    (user_09, '1992-09-15', 'male', true, true, true, NOW()),
    (user_10, '1991-10-20', 'male', true, true, true, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    onboarding_dating = EXCLUDED.onboarding_dating,
    onboarding_matrimony = EXCLUDED.onboarding_matrimony,
    onboarding_completed = EXCLUDED.onboarding_completed,
    onboarding_completed_at = EXCLUDED.onboarding_completed_at;

  -- ============================================
  -- USER PROFILES (test11-test20: Female)
  -- ============================================
  INSERT INTO user_profiles (user_id, date_of_birth, gender, onboarding_dating, onboarding_matrimony, onboarding_completed, onboarding_completed_at)
  VALUES
    (user_11, '1995-11-15', 'female', true, true, true, NOW()),
    (user_12, '1996-12-20', 'female', true, true, true, NOW()),
    (user_13, '1997-01-25', 'female', true, true, true, NOW()),
    (user_14, '1998-02-10', 'female', true, true, true, NOW()),
    (user_15, '1999-03-15', 'female', true, true, true, NOW()),
    (user_16, '2000-04-20', 'female', true, true, true, NOW()),
    (user_17, '1994-05-25', 'female', true, true, true, NOW()),
    (user_18, '1993-06-10', 'female', true, true, true, NOW()),
    (user_19, '1992-07-15', 'female', true, true, true, NOW()),
    (user_20, '1991-08-20', 'female', true, true, true, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    onboarding_dating = EXCLUDED.onboarding_dating,
    onboarding_matrimony = EXCLUDED.onboarding_matrimony,
    onboarding_completed = EXCLUDED.onboarding_completed,
    onboarding_completed_at = EXCLUDED.onboarding_completed_at;

  -- ============================================
  -- DATING PROFILES (test01-test10: Male)
  -- ============================================
  INSERT INTO dating_profile_full (user_id, name, dob, gender, bio, photos, photo_prompts, interests, prompts, this_or_that_choices, relationship_goals, preferences, setup_completed, preferences_completed, questionnaire_completed)
  VALUES
    (user_01, 'Test User 01', '1995-01-15', 'male', 'I love traveling and exploring new places. Looking for someone to share adventures with!', 
     '["https://example.com/male_01_photo1.jpg", "https://example.com/male_01_photo2.jpg", "https://example.com/male_01_photo3.jpg"]'::jsonb,
     '["Me in my element", "What I look like on a Sunday morning", "My favorite thing to do"]'::jsonb,
     '["Travel", "Photography", "Food", "Music", "Adventure"]'::jsonb,
     '[{"prompt": "My ideal first date is...", "answer": "A sunset hike followed by dinner at a cozy restaurant"}, {"prompt": "I''m looking for someone who...", "answer": "Shares my passion for travel and adventure"}, {"prompt": "My love language is...", "answer": "Quality time and physical touch"}, {"prompt": "My most controversial opinion is...", "answer": "Pineapple belongs on pizza"}, {"prompt": "I''m currently obsessed with...", "answer": "Planning my next backpacking trip"}, {"prompt": "My biggest green flag is...", "answer": "Someone who is kind to everyone, including waitstaff"}]'::jsonb,
     '[{"option_a": "Stay in on a Friday night", "option_b": "Go out and see where the night takes you", "selected": 1, "question_index": 0}, {"option_a": "Long conversations", "option_b": "Quick wit and banter", "selected": 0, "question_index": 1}, {"option_a": "Ambitious and career-focused", "option_b": "Laid-back and enjoy the journey", "selected": 1, "question_index": 2}, {"option_a": "Big celebrations", "option_b": "Small, intimate moments", "selected": 1, "question_index": 3}]'::jsonb,
     'Long-term relationship',
     '{"looking_for": "women", "min_age": 22, "max_age": 30, "max_distance": 50, "show_on_profile": true}'::jsonb,
     true, true, true),
    (user_02, 'Test User 02', '1996-02-20', 'male', 'Fitness enthusiast and food lover. Always up for trying new restaurants!',
     '["https://example.com/male_02_photo1.jpg", "https://example.com/male_02_photo2.jpg", "https://example.com/male_02_photo3.jpg"]'::jsonb,
     '["Me in my element", "What I look like on a Sunday morning", "My favorite thing to do"]'::jsonb,
     '["Fitness", "Food", "Gaming", "Movies", "Cooking"]'::jsonb,
     '[{"prompt": "My ideal first date is...", "answer": "Trying a new restaurant and then watching a movie"}, {"prompt": "I''m looking for someone who...", "answer": "Values health and fitness as much as I do"}, {"prompt": "My love language is...", "answer": "Acts of service and words of affirmation"}, {"prompt": "My most controversial opinion is...", "answer": "Morning workouts are better than evening ones"}, {"prompt": "I''m currently obsessed with...", "answer": "Perfecting my home cooking skills"}, {"prompt": "My biggest green flag is...", "answer": "Someone who can make me laugh"}]'::jsonb,
     '[{"option_a": "Stay in on a Friday night", "option_b": "Go out and see where the night takes you", "selected": 0, "question_index": 0}, {"option_a": "Long conversations", "option_b": "Quick wit and banter", "selected": 1, "question_index": 1}, {"option_a": "Ambitious and career-focused", "option_b": "Laid-back and enjoy the journey", "selected": 0, "question_index": 2}, {"option_a": "Big celebrations", "option_b": "Small, intimate moments", "selected": 0, "question_index": 3}]'::jsonb,
     'Dating to see where it goes',
     '{"looking_for": "women", "min_age": 23, "max_age": 31, "max_distance": 50, "show_on_profile": true}'::jsonb,
     true, true, true),
    (user_03, 'Test User 03', '1997-03-25', 'male', 'Tech geek by day, adventure seeker by weekend. Love hiking and coding!',
     '["https://example.com/male_03_photo1.jpg", "https://example.com/male_03_photo2.jpg", "https://example.com/male_03_photo3.jpg"]'::jsonb,
     '["Me in my element", "What I look like on a Sunday morning", "My favorite thing to do"]'::jsonb,
     '["Technology", "Hiking", "Coding", "Reading", "Problem Solving"]'::jsonb,
     '[{"prompt": "My ideal first date is...", "answer": "A coding session at a coffee shop followed by a nature hike"}, {"prompt": "I''m looking for someone who...", "answer": "Appreciates both technology and the outdoors"}, {"prompt": "My love language is...", "answer": "Quality time and acts of service"}, {"prompt": "My most controversial opinion is...", "answer": "JavaScript is better than Python"}, {"prompt": "I''m currently obsessed with...", "answer": "Building my side project and weekend hikes"}, {"prompt": "My biggest green flag is...", "answer": "Someone who asks thoughtful questions"}]'::jsonb,
     '[{"option_a": "Stay in on a Friday night", "option_b": "Go out and see where the night takes you", "selected": 0, "question_index": 0}, {"option_a": "Long conversations", "option_b": "Quick wit and banter", "selected": 0, "question_index": 1}, {"option_a": "Ambitious and career-focused", "option_b": "Laid-back and enjoy the journey", "selected": 0, "question_index": 2}, {"option_a": "Big celebrations", "option_b": "Small, intimate moments", "selected": 1, "question_index": 3}]'::jsonb,
     'Long-term relationship',
     '{"looking_for": "women", "min_age": 24, "max_age": 32, "max_distance": 50, "show_on_profile": true}'::jsonb,
     true, true, true),
    (user_04, 'Test User 04', '1998-04-10', 'male', 'Musician and coffee addict. Always looking for the perfect cup and perfect harmony.',
     '["https://example.com/male_04_photo1.jpg", "https://example.com/male_04_photo2.jpg", "https://example.com/male_04_photo3.jpg"]'::jsonb,
     '["Me in my element", "What I look like on a Sunday morning", "My favorite thing to do"]'::jsonb,
     '["Music", "Coffee", "Art", "Concerts", "Songwriting"]'::jsonb,
     '[{"prompt": "My ideal first date is...", "answer": "A live music performance followed by late-night coffee"}, {"prompt": "I''m looking for someone who...", "answer": "Shares my passion for music and arts"}, {"prompt": "My love language is...", "answer": "Words of affirmation and physical touch"}, {"prompt": "My most controversial opinion is...", "answer": "Acoustic is better than electric"}, {"prompt": "I''m currently obsessed with...", "answer": "Learning new guitar techniques and discovering indie artists"}, {"prompt": "My biggest green flag is...", "answer": "Someone who can appreciate good music"}]'::jsonb,
     '[{"option_a": "Stay in on a Friday night", "option_b": "Go out and see where the night takes you", "selected": 1, "question_index": 0}, {"option_a": "Long conversations", "option_b": "Quick wit and banter", "selected": 0, "question_index": 1}, {"option_a": "Ambitious and career-focused", "option_b": "Laid-back and enjoy the journey", "selected": 1, "question_index": 2}, {"option_a": "Big celebrations", "option_b": "Small, intimate moments", "selected": 1, "question_index": 3}]'::jsonb,
     'Dating to see where it goes',
     '{"looking_for": "women", "min_age": 25, "max_age": 33, "max_distance": 50, "show_on_profile": true}'::jsonb,
     true, true, true),
    (user_05, 'Test User 05', '1999-05-15', 'male', 'Sports fanatic and weekend warrior. Love playing basketball and watching games!',
     '["https://example.com/male_05_photo1.jpg", "https://example.com/male_05_photo2.jpg", "https://example.com/male_05_photo3.jpg"]'::jsonb,
     '["Me in my element", "What I look like on a Sunday morning", "My favorite thing to do"]'::jsonb,
     '["Sports", "Basketball", "Fitness", "Travel", "Competition"]'::jsonb,
     '[{"prompt": "My ideal first date is...", "answer": "Playing a game of basketball together and then grabbing food"}, {"prompt": "I''m looking for someone who...", "answer": "Is active and enjoys sports as much as I do"}, {"prompt": "My love language is...", "answer": "Physical touch and quality time"}, {"prompt": "My most controversial opinion is...", "answer": "LeBron is the GOAT"}, {"prompt": "I''m currently obsessed with...", "answer": "Improving my three-point shot and watching NBA games"}, {"prompt": "My biggest green flag is...", "answer": "Someone who can keep up with my energy"}]'::jsonb,
     '[{"option_a": "Stay in on a Friday night", "option_b": "Go out and see where the night takes you", "selected": 1, "question_index": 0}, {"option_a": "Long conversations", "option_b": "Quick wit and banter", "selected": 1, "question_index": 1}, {"option_a": "Ambitious and career-focused", "option_b": "Laid-back and enjoy the journey", "selected": 0, "question_index": 2}, {"option_a": "Big celebrations", "option_b": "Small, intimate moments", "selected": 0, "question_index": 3}]'::jsonb,
     'Long-term relationship',
     '{"looking_for": "women", "min_age": 26, "max_age": 34, "max_distance": 50, "show_on_profile": true}'::jsonb,
     true, true, true),
    (user_06, 'Test User 06', '2000-06-20', 'male', 'Bookworm and nature lover. Perfect day: reading in a park with good coffee.',
     '["https://example.com/male_06_photo1.jpg", "https://example.com/male_06_photo2.jpg", "https://example.com/male_06_photo3.jpg"]'::jsonb,
     '["Me in my element", "What I look like on a Sunday morning", "My favorite thing to do"]'::jsonb,
     '["Reading", "Nature", "Coffee", "Writing", "Poetry"]'::jsonb,
     '[{"prompt": "My ideal first date is...", "answer": "A bookstore followed by reading together in a quiet cafe"}, {"prompt": "I''m looking for someone who...", "answer": "Loves books and deep conversations"}, {"prompt": "My love language is...", "answer": "Words of affirmation and quality time"}, {"prompt": "My most controversial opinion is...", "answer": "Physical books are better than e-books"}, {"prompt": "I''m currently obsessed with...", "answer": "Reading philosophy and writing poetry"}, {"prompt": "My biggest green flag is...", "answer": "Someone who can discuss books for hours"}]'::jsonb,
     '[{"option_a": "Stay in on a Friday night", "option_b": "Go out and see where the night takes you", "selected": 0, "question_index": 0}, {"option_a": "Long conversations", "option_b": "Quick wit and banter", "selected": 0, "question_index": 1}, {"option_a": "Ambitious and career-focused", "option_b": "Laid-back and enjoy the journey", "selected": 1, "question_index": 2}, {"option_a": "Big celebrations", "option_b": "Small, intimate moments", "selected": 1, "question_index": 3}]'::jsonb,
     'Serious relationship leading to marriage',
     '{"looking_for": "women", "min_age": 27, "max_age": 35, "max_distance": 50, "show_on_profile": true}'::jsonb,
     true, true, true),
    (user_07, 'Test User 07', '1994-07-25', 'male', 'Chef at heart, love cooking and trying new cuisines. Food brings people together!',
     '["https://example.com/male_07_photo1.jpg", "https://example.com/male_07_photo2.jpg", "https://example.com/male_07_photo3.jpg"]'::jsonb,
     '["Me in my element", "What I look like on a Sunday morning", "My favorite thing to do"]'::jsonb,
     '["Cooking", "Food", "Travel", "Wine", "Culinary Arts"]'::jsonb,
     '[{"prompt": "My ideal first date is...", "answer": "Cooking a meal together and then enjoying it with wine"}, {"prompt": "I''m looking for someone who...", "answer": "Appreciates good food and loves trying new cuisines"}, {"prompt": "My love language is...", "answer": "Acts of service and quality time"}, {"prompt": "My most controversial opinion is...", "answer": "Pasta should be al dente, always"}, {"prompt": "I''m currently obsessed with...", "answer": "Perfecting my risotto recipe and exploring fusion cuisine"}, {"prompt": "My biggest green flag is...", "answer": "Someone who enjoys cooking together"}]'::jsonb,
     '[{"option_a": "Stay in on a Friday night", "option_b": "Go out and see where the night takes you", "selected": 0, "question_index": 0}, {"option_a": "Long conversations", "option_b": "Quick wit and banter", "selected": 0, "question_index": 1}, {"option_a": "Ambitious and career-focused", "option_b": "Laid-back and enjoy the journey", "selected": 0, "question_index": 2}, {"option_a": "Big celebrations", "option_b": "Small, intimate moments", "selected": 1, "question_index": 3}]'::jsonb,
     'Long-term relationship',
     '{"looking_for": "women", "min_age": 28, "max_age": 36, "max_distance": 50, "show_on_profile": true}'::jsonb,
     true, true, true),
    (user_08, 'Test User 08', '1993-08-10', 'male', 'Yoga instructor and mindfulness advocate. Balance in life is everything.',
     '["https://example.com/male_08_photo1.jpg", "https://example.com/male_08_photo2.jpg", "https://example.com/male_08_photo3.jpg"]'::jsonb,
     '["Me in my element", "What I look like on a Sunday morning", "My favorite thing to do"]'::jsonb,
     '["Yoga", "Meditation", "Wellness", "Nature", "Mindfulness"]'::jsonb,
     '[{"prompt": "My ideal first date is...", "answer": "A sunrise yoga session followed by a healthy breakfast"}, {"prompt": "I''m looking for someone who...", "answer": "Values inner peace and personal growth"}, {"prompt": "My love language is...", "answer": "Quality time and acts of service"}, {"prompt": "My most controversial opinion is...", "answer": "Meditation is more important than exercise"}, {"prompt": "I''m currently obsessed with...", "answer": "Advanced yoga poses and studying mindfulness"}, {"prompt": "My biggest green flag is...", "answer": "Someone who practices self-awareness"}]'::jsonb,
     '[{"option_a": "Stay in on a Friday night", "option_b": "Go out and see where the night takes you", "selected": 0, "question_index": 0}, {"option_a": "Long conversations", "option_b": "Quick wit and banter", "selected": 0, "question_index": 1}, {"option_a": "Ambitious and career-focused", "option_b": "Laid-back and enjoy the journey", "selected": 1, "question_index": 2}, {"option_a": "Big celebrations", "option_b": "Small, intimate moments", "selected": 1, "question_index": 3}]'::jsonb,
     'Serious relationship leading to marriage',
     '{"looking_for": "women", "min_age": 29, "max_age": 37, "max_distance": 50, "show_on_profile": true}'::jsonb,
     true, true, true),
    (user_09, 'Test User 09', '1992-09-15', 'male', 'Entrepreneur and startup enthusiast. Building the future, one idea at a time.',
     '["https://example.com/male_09_photo1.jpg", "https://example.com/male_09_photo2.jpg", "https://example.com/male_09_photo3.jpg"]'::jsonb,
     '["Me in my element", "What I look like on a Sunday morning", "My favorite thing to do"]'::jsonb,
     '["Business", "Startups", "Technology", "Networking", "Innovation"]'::jsonb,
     '[{"prompt": "My ideal first date is...", "answer": "A networking event followed by discussing business ideas over drinks"}, {"prompt": "I''m looking for someone who...", "answer": "Is ambitious and supports my entrepreneurial journey"}, {"prompt": "My love language is...", "answer": "Words of affirmation and acts of service"}, {"prompt": "My most controversial opinion is...", "answer": "Failure is the best teacher"}, {"prompt": "I''m currently obsessed with...", "answer": "Scaling my startup and meeting other entrepreneurs"}, {"prompt": "My biggest green flag is...", "answer": "Someone who understands the startup lifestyle"}]'::jsonb,
     '[{"option_a": "Stay in on a Friday night", "option_b": "Go out and see where the night takes you", "selected": 1, "question_index": 0}, {"option_a": "Long conversations", "option_b": "Quick wit and banter", "selected": 1, "question_index": 1}, {"option_a": "Ambitious and career-focused", "option_b": "Laid-back and enjoy the journey", "selected": 0, "question_index": 2}, {"option_a": "Big celebrations", "option_b": "Small, intimate moments", "selected": 0, "question_index": 3}]'::jsonb,
     'Long-term relationship',
     '{"looking_for": "women", "min_age": 30, "max_age": 38, "max_distance": 50, "show_on_profile": true}'::jsonb,
     true, true, true),
    (user_10, 'Test User 10', '1991-10-20', 'male', 'Photographer capturing life moments. Every picture tells a story.',
     '["https://example.com/male_10_photo1.jpg", "https://example.com/male_10_photo2.jpg", "https://example.com/male_10_photo3.jpg"]'::jsonb,
     '["Me in my element", "What I look like on a Sunday morning", "My favorite thing to do"]'::jsonb,
     '["Photography", "Art", "Travel", "Adventure", "Storytelling"]'::jsonb,
     '[{"prompt": "My ideal first date is...", "answer": "A photo walk through the city capturing moments together"}, {"prompt": "I''m looking for someone who...", "answer": "Appreciates art and loves to explore"}, {"prompt": "My love language is...", "answer": "Quality time and physical touch"}, {"prompt": "My most controversial opinion is...", "answer": "Film photography is superior to digital"}, {"prompt": "I''m currently obsessed with...", "answer": "Street photography and documenting everyday life"}, {"prompt": "My biggest green flag is...", "answer": "Someone who can see beauty in ordinary moments"}]'::jsonb,
     '[{"option_a": "Stay in on a Friday night", "option_b": "Go out and see where the night takes you", "selected": 1, "question_index": 0}, {"option_a": "Long conversations", "option_b": "Quick wit and banter", "selected": 0, "question_index": 1}, {"option_a": "Ambitious and career-focused", "option_b": "Laid-back and enjoy the journey", "selected": 1, "question_index": 2}, {"option_a": "Big celebrations", "option_b": "Small, intimate moments", "selected": 1, "question_index": 3}]'::jsonb,
     'Dating to see where it goes',
     '{"looking_for": "women", "min_age": 31, "max_age": 39, "max_distance": 50, "show_on_profile": true}'::jsonb,
     true, true, true)
  ON CONFLICT (user_id) DO UPDATE SET
    name = EXCLUDED.name,
    photos = EXCLUDED.photos,
    setup_completed = EXCLUDED.setup_completed,
    preferences_completed = EXCLUDED.preferences_completed,
    questionnaire_completed = EXCLUDED.questionnaire_completed;

  -- ============================================
  -- DATING PROFILES (test11-test20: Female)
  -- ============================================
  INSERT INTO dating_profile_full (user_id, name, dob, gender, bio, photos, photo_prompts, interests, prompts, this_or_that_choices, relationship_goals, preferences, setup_completed, preferences_completed, questionnaire_completed)
  VALUES
    (user_11, 'Test User 11', '1995-11-15', 'female', 'Art lover and creative soul. Expressing myself through painting and design.',
     '["https://example.com/female_01_photo1.jpg", "https://example.com/female_01_photo2.jpg", "https://example.com/female_01_photo3.jpg"]'::jsonb,
     '["Me in my element", "What I look like on a Sunday morning", "My favorite thing to do"]'::jsonb,
     '["Art", "Design", "Painting", "Museums", "Creativity"]'::jsonb,
     '[{"prompt": "My ideal first date is...", "answer": "Visiting an art gallery followed by painting together"}, {"prompt": "I''m looking for someone who...", "answer": "Appreciates creativity and artistic expression"}, {"prompt": "My love language is...", "answer": "Quality time and words of affirmation"}, {"prompt": "My most controversial opinion is...", "answer": "Abstract art is more meaningful than realistic art"}, {"prompt": "I''m currently obsessed with...", "answer": "Learning watercolor techniques and visiting new galleries"}, {"prompt": "My biggest green flag is...", "answer": "Someone who supports my creative pursuits"}]'::jsonb,
     '[{"option_a": "Stay in on a Friday night", "option_b": "Go out and see where the night takes you", "selected": 1, "question_index": 0}, {"option_a": "Long conversations", "option_b": "Quick wit and banter", "selected": 0, "question_index": 1}, {"option_a": "Ambitious and career-focused", "option_b": "Laid-back and enjoy the journey", "selected": 1, "question_index": 2}, {"option_a": "Big celebrations", "option_b": "Small, intimate moments", "selected": 1, "question_index": 3}]'::jsonb,
     'Long-term relationship',
     '{"looking_for": "men", "min_age": 25, "max_age": 35, "max_distance": 50, "show_on_profile": true}'::jsonb,
     true, true, true),
    (user_12, 'Test User 12', '1996-12-20', 'female', 'Dancer and fitness coach. Movement is my meditation and passion.',
     '["https://example.com/female_02_photo1.jpg", "https://example.com/female_02_photo2.jpg", "https://example.com/female_02_photo3.jpg"]'::jsonb,
     '["Me in my element", "What I look like on a Sunday morning", "My favorite thing to do"]'::jsonb,
     '["Dance", "Fitness", "Yoga", "Music", "Movement"]'::jsonb,
     '[{"prompt": "My ideal first date is...", "answer": "A dance class together followed by a healthy meal"}, {"prompt": "I''m looking for someone who...", "answer": "Values fitness and an active lifestyle"}, {"prompt": "My love language is...", "answer": "Physical touch and quality time"}, {"prompt": "My most controversial opinion is...", "answer": "Dancing is the best form of exercise"}, {"prompt": "I''m currently obsessed with...", "answer": "Learning new dance styles and improving flexibility"}, {"prompt": "My biggest green flag is...", "answer": "Someone who isn''t afraid to dance with me"}]'::jsonb,
     '[{"option_a": "Stay in on a Friday night", "option_b": "Go out and see where the night takes you", "selected": 1, "question_index": 0}, {"option_a": "Long conversations", "option_b": "Quick wit and banter", "selected": 1, "question_index": 1}, {"option_a": "Ambitious and career-focused", "option_b": "Laid-back and enjoy the journey", "selected": 0, "question_index": 2}, {"option_a": "Big celebrations", "option_b": "Small, intimate moments", "selected": 0, "question_index": 3}]'::jsonb,
     'Long-term relationship',
     '{"looking_for": "men", "min_age": 26, "max_age": 36, "max_distance": 50, "show_on_profile": true}'::jsonb,
     true, true, true),
    (user_13, 'Test User 13', '1997-01-25', 'female', 'Software engineer who loves coding and solving problems. Tech and coffee enthusiast!',
     '["https://example.com/female_03_photo1.jpg", "https://example.com/female_03_photo2.jpg", "https://example.com/female_03_photo3.jpg"]'::jsonb,
     '["Me in my element", "What I look like on a Sunday morning", "My favorite thing to do"]'::jsonb,
     '["Technology", "Coding", "Coffee", "Reading", "Problem Solving"]'::jsonb,
     '[{"prompt": "My ideal first date is...", "answer": "Pair programming session at a coffee shop"}, {"prompt": "I''m looking for someone who...", "answer": "Appreciates tech and intellectual conversations"}, {"prompt": "My love language is...", "answer": "Acts of service and words of affirmation"}, {"prompt": "My most controversial opinion is...", "answer": "Python is overrated"}, {"prompt": "I''m currently obsessed with...", "answer": "Building side projects and trying new coffee shops"}, {"prompt": "My biggest green flag is...", "answer": "Someone who can debug code with me"}]'::jsonb,
     '[{"option_a": "Stay in on a Friday night", "option_b": "Go out and see where the night takes you", "selected": 0, "question_index": 0}, {"option_a": "Long conversations", "option_b": "Quick wit and banter", "selected": 0, "question_index": 1}, {"option_a": "Ambitious and career-focused", "option_b": "Laid-back and enjoy the journey", "selected": 0, "question_index": 2}, {"option_a": "Big celebrations", "option_b": "Small, intimate moments", "selected": 1, "question_index": 3}]'::jsonb,
     'Serious relationship leading to marriage',
     '{"looking_for": "men", "min_age": 27, "max_age": 37, "max_distance": 50, "show_on_profile": true}'::jsonb,
     true, true, true),
    (user_14, 'Test User 14', '1998-02-10', 'female', 'Travel blogger exploring the world one destination at a time. Adventure awaits!',
     '["https://example.com/female_04_photo1.jpg", "https://example.com/female_04_photo2.jpg", "https://example.com/female_04_photo3.jpg"]'::jsonb,
     '["Me in my element", "What I look like on a Sunday morning", "My favorite thing to do"]'::jsonb,
     '["Travel", "Photography", "Adventure", "Writing", "Exploration"]'::jsonb,
     '[{"prompt": "My ideal first date is...", "answer": "A spontaneous road trip to a nearby town"}, {"prompt": "I''m looking for someone who...", "answer": "Loves adventure and exploring new places"}, {"prompt": "My love language is...", "answer": "Quality time and physical touch"}, {"prompt": "My most controversial opinion is...", "answer": "Traveling solo is better than with others"}, {"prompt": "I''m currently obsessed with...", "answer": "Planning my next international trip and travel photography"}, {"prompt": "My biggest green flag is...", "answer": "Someone who is spontaneous and loves adventure"}]'::jsonb,
     '[{"option_a": "Stay in on a Friday night", "option_b": "Go out and see where the night takes you", "selected": 1, "question_index": 0}, {"option_a": "Long conversations", "option_b": "Quick wit and banter", "selected": 0, "question_index": 1}, {"option_a": "Ambitious and career-focused", "option_b": "Laid-back and enjoy the journey", "selected": 1, "question_index": 2}, {"option_a": "Big celebrations", "option_b": "Small, intimate moments", "selected": 1, "question_index": 3}]'::jsonb,
     'Dating to see where it goes',
     '{"looking_for": "men", "min_age": 28, "max_age": 38, "max_distance": 50, "show_on_profile": true}'::jsonb,
     true, true, true),
    (user_15, 'Test User 15', '1999-03-15', 'female', 'Chef and food stylist. Creating beautiful dishes and memories around the table.',
     '["https://example.com/female_05_photo1.jpg", "https://example.com/female_05_photo2.jpg", "https://example.com/female_05_photo3.jpg"]'::jsonb,
     '["Me in my element", "What I look like on a Sunday morning", "My favorite thing to do"]'::jsonb,
     '["Cooking", "Food", "Photography", "Entertaining", "Culinary Arts"]'::jsonb,
     '[{"prompt": "My ideal first date is...", "answer": "Cooking a meal together and styling it for photos"}, {"prompt": "I''m looking for someone who...", "answer": "Appreciates good food and enjoys cooking"}, {"prompt": "My love language is...", "answer": "Acts of service and quality time"}, {"prompt": "My most controversial opinion is...", "answer": "Presentation matters as much as taste"}, {"prompt": "I''m currently obsessed with...", "answer": "Food styling and trying new fusion recipes"}, {"prompt": "My biggest green flag is...", "answer": "Someone who enjoys cooking together and trying new foods"}]'::jsonb,
     '[{"option_a": "Stay in on a Friday night", "option_b": "Go out and see where the night takes you", "selected": 0, "question_index": 0}, {"option_a": "Long conversations", "option_b": "Quick wit and banter", "selected": 0, "question_index": 1}, {"option_a": "Ambitious and career-focused", "option_b": "Laid-back and enjoy the journey", "selected": 0, "question_index": 2}, {"option_a": "Big celebrations", "option_b": "Small, intimate moments", "selected": 1, "question_index": 3}]'::jsonb,
     'Long-term relationship',
     '{"looking_for": "men", "min_age": 29, "max_age": 39, "max_distance": 50, "show_on_profile": true}'::jsonb,
     true, true, true),
    (user_16, 'Test User 16', '2000-04-20', 'female', 'Yoga instructor and wellness coach. Helping others find balance and peace.',
     '["https://example.com/female_06_photo1.jpg", "https://example.com/female_06_photo2.jpg", "https://example.com/female_06_photo3.jpg"]'::jsonb,
     '["Me in my element", "What I look like on a Sunday morning", "My favorite thing to do"]'::jsonb,
     '["Yoga", "Wellness", "Meditation", "Nature", "Mindfulness"]'::jsonb,
     '[{"prompt": "My ideal first date is...", "answer": "A sunrise yoga session followed by a healthy breakfast"}, {"prompt": "I''m looking for someone who...", "answer": "Values wellness and inner peace"}, {"prompt": "My love language is...", "answer": "Quality time and acts of service"}, {"prompt": "My most controversial opinion is...", "answer": "Yoga is for everyone, not just flexible people"}, {"prompt": "I''m currently obsessed with...", "answer": "Advanced yoga poses and teaching meditation"}, {"prompt": "My biggest green flag is...", "answer": "Someone who practices self-care and mindfulness"}]'::jsonb,
     '[{"option_a": "Stay in on a Friday night", "option_b": "Go out and see where the night takes you", "selected": 0, "question_index": 0}, {"option_a": "Long conversations", "option_b": "Quick wit and banter", "selected": 0, "question_index": 1}, {"option_a": "Ambitious and career-focused", "option_b": "Laid-back and enjoy the journey", "selected": 1, "question_index": 2}, {"option_a": "Big celebrations", "option_b": "Small, intimate moments", "selected": 1, "question_index": 3}]'::jsonb,
     'Serious relationship leading to marriage',
     '{"looking_for": "men", "min_age": 30, "max_age": 40, "max_distance": 50, "show_on_profile": true}'::jsonb,
     true, true, true),
    (user_17, 'Test User 17', '1994-05-25', 'female', 'Musician and songwriter. Music is the language of my soul.',
     '["https://example.com/female_07_photo1.jpg", "https://example.com/female_07_photo2.jpg", "https://example.com/female_07_photo3.jpg"]'::jsonb,
     '["Me in my element", "What I look like on a Sunday morning", "My favorite thing to do"]'::jsonb,
     '["Music", "Singing", "Guitar", "Concerts", "Songwriting"]'::jsonb,
     '[{"prompt": "My ideal first date is...", "answer": "A live music performance followed by jamming together"}, {"prompt": "I''m looking for someone who...", "answer": "Appreciates music and understands the creative process"}, {"prompt": "My love language is...", "answer": "Words of affirmation and quality time"}, {"prompt": "My most controversial opinion is...", "answer": "Acoustic music is more emotional than electronic"}, {"prompt": "I''m currently obsessed with...", "answer": "Writing new songs and performing at open mics"}, {"prompt": "My biggest green flag is...", "answer": "Someone who can appreciate live music"}]'::jsonb,
     '[{"option_a": "Stay in on a Friday night", "option_b": "Go out and see where the night takes you", "selected": 1, "question_index": 0}, {"option_a": "Long conversations", "option_b": "Quick wit and banter", "selected": 0, "question_index": 1}, {"option_a": "Ambitious and career-focused", "option_b": "Laid-back and enjoy the journey", "selected": 1, "question_index": 2}, {"option_a": "Big celebrations", "option_b": "Small, intimate moments", "selected": 1, "question_index": 3}]'::jsonb,
     'Long-term relationship',
     '{"looking_for": "men", "min_age": 31, "max_age": 41, "max_distance": 50, "show_on_profile": true}'::jsonb,
     true, true, true),
    (user_18, 'Test User 18', '1993-06-10', 'female', 'Doctor and health advocate. Dedicated to helping others live their best lives.',
     '["https://example.com/female_08_photo1.jpg", "https://example.com/female_08_photo2.jpg", "https://example.com/female_08_photo3.jpg"]'::jsonb,
     '["Me in my element", "What I look like on a Sunday morning", "My favorite thing to do"]'::jsonb,
     '["Medicine", "Health", "Reading", "Travel", "Helping Others"]'::jsonb,
     '[{"prompt": "My ideal first date is...", "answer": "A quiet dinner followed by discussing books and life"}, {"prompt": "I''m looking for someone who...", "answer": "Values health, education, and helping others"}, {"prompt": "My love language is...", "answer": "Acts of service and words of affirmation"}, {"prompt": "My most controversial opinion is...", "answer": "Prevention is more important than treatment"}, {"prompt": "I''m currently obsessed with...", "answer": "Medical research and planning my next vacation"}, {"prompt": "My biggest green flag is...", "answer": "Someone who is compassionate and understanding"}]'::jsonb,
     '[{"option_a": "Stay in on a Friday night", "option_b": "Go out and see where the night takes you", "selected": 0, "question_index": 0}, {"option_a": "Long conversations", "option_b": "Quick wit and banter", "selected": 0, "question_index": 1}, {"option_a": "Ambitious and career-focused", "option_b": "Laid-back and enjoy the journey", "selected": 0, "question_index": 2}, {"option_a": "Big celebrations", "option_b": "Small, intimate moments", "selected": 1, "question_index": 3}]'::jsonb,
     'Serious relationship leading to marriage',
     '{"looking_for": "men", "min_age": 32, "max_age": 42, "max_distance": 50, "show_on_profile": true}'::jsonb,
     true, true, true),
    (user_19, 'Test User 19', '1992-07-15', 'female', 'Marketing professional and social butterfly. Love connecting with people and ideas.',
     '["https://example.com/female_09_photo1.jpg", "https://example.com/female_09_photo2.jpg", "https://example.com/female_09_photo3.jpg"]'::jsonb,
     '["Me in my element", "What I look like on a Sunday morning", "My favorite thing to do"]'::jsonb,
     '["Marketing", "Networking", "Social Media", "Events", "Connecting"]'::jsonb,
     '[{"prompt": "My ideal first date is...", "answer": "A networking event followed by drinks and deep conversation"}, {"prompt": "I''m looking for someone who...", "answer": "Is social and enjoys meeting new people"}, {"prompt": "My love language is...", "answer": "Words of affirmation and quality time"}, {"prompt": "My most controversial opinion is...", "answer": "Networking is more valuable than qualifications"}, {"prompt": "I''m currently obsessed with...", "answer": "Building my personal brand and attending industry events"}, {"prompt": "My biggest green flag is...", "answer": "Someone who can hold engaging conversations"}]'::jsonb,
     '[{"option_a": "Stay in on a Friday night", "option_b": "Go out and see where the night takes you", "selected": 1, "question_index": 0}, {"option_a": "Long conversations", "option_b": "Quick wit and banter", "selected": 1, "question_index": 1}, {"option_a": "Ambitious and career-focused", "option_b": "Laid-back and enjoy the journey", "selected": 0, "question_index": 2}, {"option_a": "Big celebrations", "option_b": "Small, intimate moments", "selected": 0, "question_index": 3}]'::jsonb,
     'Long-term relationship',
     '{"looking_for": "men", "min_age": 33, "max_age": 43, "max_distance": 50, "show_on_profile": true}'::jsonb,
     true, true, true),
    (user_20, 'Test User 20', '1991-08-20', 'female', 'Teacher and lifelong learner. Passionate about education and making a difference.',
     '["https://example.com/female_10_photo1.jpg", "https://example.com/female_10_photo2.jpg", "https://example.com/female_10_photo3.jpg"]'::jsonb,
     '["Me in my element", "What I look like on a Sunday morning", "My favorite thing to do"]'::jsonb,
     '["Education", "Reading", "Travel", "Volunteering", "Learning"]'::jsonb,
     '[{"prompt": "My ideal first date is...", "answer": "A museum visit followed by discussing books over coffee"}, {"prompt": "I''m looking for someone who...", "answer": "Values education and continuous learning"}, {"prompt": "My love language is...", "answer": "Words of affirmation and acts of service"}, {"prompt": "My most controversial opinion is...", "answer": "Education should be free for everyone"}, {"prompt": "I''m currently obsessed with...", "answer": "Learning new teaching methods and planning educational trips"}, {"prompt": "My biggest green flag is...", "answer": "Someone who is curious and loves learning"}]'::jsonb,
     '[{"option_a": "Stay in on a Friday night", "option_b": "Go out and see where the night takes you", "selected": 0, "question_index": 0}, {"option_a": "Long conversations", "option_b": "Quick wit and banter", "selected": 0, "question_index": 1}, {"option_a": "Ambitious and career-focused", "option_b": "Laid-back and enjoy the journey", "selected": 1, "question_index": 2}, {"option_a": "Big celebrations", "option_b": "Small, intimate moments", "selected": 1, "question_index": 3}]'::jsonb,
     'Serious relationship leading to marriage',
     '{"looking_for": "men", "min_age": 34, "max_age": 44, "max_distance": 50, "show_on_profile": true}'::jsonb,
     true, true, true)
  ON CONFLICT (user_id) DO UPDATE SET
    name = EXCLUDED.name,
    photos = EXCLUDED.photos,
    setup_completed = EXCLUDED.setup_completed,
    preferences_completed = EXCLUDED.preferences_completed,
    questionnaire_completed = EXCLUDED.questionnaire_completed;

  -- ============================================
  -- MATRIMONY PROFILES (test01-test10: Male)
  -- ============================================
  INSERT INTO matrimony_profile_full (user_id, name, age, gender, created_by, photos, personal, career, family, cultural, bio, step1_completed, step2_completed, step3_completed, step4_completed, step5_completed, step6_completed, step7_completed, profile_completed)
  VALUES
    (user_01, 'Test User 01', 29, 'Male', 'Self',
     '["https://example.com/male_01_photo1.jpg", "https://example.com/male_01_photo2.jpg", "https://example.com/male_01_photo3.jpg"]'::jsonb,
     '{"height_cm": 175, "height_unit": "cm", "complexion": "Fair", "body_type": "Athletic", "diet": "Non-vegetarian", "smoker": false, "drinker": "Socially", "marital_status": "Never married"}'::jsonb,
     '{"highest_education": "Masters", "college": "IIT Delhi", "job_title": "Software Engineer", "company": "Tech Corp", "annual_income": "10-15 Lakhs", "work_location": {"city": "Bangalore", "state": "Karnataka", "country": "India"}}'::jsonb,
     '{"family_type": "Nuclear", "family_values": "Traditional", "father_occupation": "Business", "mother_occupation": "Homemaker", "brothers": 1, "sisters": 0, "siblings_married": "Yes"}'::jsonb,
     '{"religion": "Hindu", "mother_tongue": "Hindi", "community": "Punjabi", "sub_caste": "Khatri", "date_of_birth": "1995-01-15", "place_of_birth": "Delhi"}'::jsonb,
     'Looking for a life partner who shares similar values and interests. Family-oriented and career-focused. Love traveling and exploring new places.',
     true, true, true, true, true, true, true, true),
    (user_02, 'Test User 02', 28, 'Male', 'Self',
     '["https://example.com/male_02_photo1.jpg", "https://example.com/male_02_photo2.jpg", "https://example.com/male_02_photo3.jpg"]'::jsonb,
     '{"height_cm": 180, "height_unit": "cm", "complexion": "Wheatish", "body_type": "Average", "diet": "Vegetarian", "smoker": false, "drinker": "Never", "marital_status": "Never married"}'::jsonb,
     '{"highest_education": "Bachelors", "college": "DU", "job_title": "Marketing Manager", "company": "Marketing Inc", "annual_income": "8-12 Lakhs", "work_location": {"city": "Mumbai", "state": "Maharashtra", "country": "India"}}'::jsonb,
     '{"family_type": "Joint", "family_values": "Modern", "father_occupation": "Service", "mother_occupation": "Teacher", "brothers": 0, "sisters": 1, "siblings_married": "No"}'::jsonb,
     '{"religion": "Hindu", "mother_tongue": "Marathi", "community": "Marathi", "date_of_birth": "1996-02-20", "place_of_birth": "Mumbai"}'::jsonb,
     'Seeking a compatible partner for a happy married life. Value honesty, respect, and understanding in relationships.',
     true, true, true, true, true, true, true, true),
    (user_03, 'Test User 03', 27, 'Male', 'Self',
     '["https://example.com/male_03_photo1.jpg", "https://example.com/male_03_photo2.jpg", "https://example.com/male_03_photo3.jpg"]'::jsonb,
     '{"height_cm": 178, "height_unit": "cm", "complexion": "Fair", "body_type": "Slim", "diet": "Vegetarian", "smoker": false, "drinker": "Never", "marital_status": "Never married"}'::jsonb,
     '{"highest_education": "Masters", "college": "IISc Bangalore", "job_title": "Data Scientist", "company": "AI Solutions", "annual_income": "15-20 Lakhs", "work_location": {"city": "Bangalore", "state": "Karnataka", "country": "India"}}'::jsonb,
     '{"family_type": "Nuclear", "family_values": "Moderate", "father_occupation": "Engineer", "mother_occupation": "Doctor", "brothers": 1, "sisters": 1, "siblings_married": "Partial"}'::jsonb,
     '{"religion": "Hindu", "mother_tongue": "Kannada", "community": "Kannadiga", "date_of_birth": "1997-03-25", "place_of_birth": "Bangalore"}'::jsonb,
     'Tech professional looking for an educated and understanding life partner. Believe in equality and mutual respect.',
     true, true, true, true, true, true, true, true),
    (user_04, 'Test User 04', 26, 'Male', 'Self',
     '["https://example.com/male_04_photo1.jpg", "https://example.com/male_04_photo2.jpg", "https://example.com/male_04_photo3.jpg"]'::jsonb,
     '{"height_cm": 172, "height_unit": "cm", "complexion": "Wheatish", "body_type": "Average", "diet": "Non-vegetarian", "smoker": false, "drinker": "Socially", "marital_status": "Never married"}'::jsonb,
     '{"highest_education": "Bachelors", "college": "NIT", "job_title": "Mechanical Engineer", "company": "Auto Industries", "annual_income": "7-10 Lakhs", "work_location": {"city": "Chennai", "state": "Tamil Nadu", "country": "India"}}'::jsonb,
     '{"family_type": "Nuclear", "family_values": "Traditional", "father_occupation": "Business", "mother_occupation": "Homemaker", "brothers": 0, "sisters": 2, "siblings_married": "No"}'::jsonb,
     '{"religion": "Hindu", "mother_tongue": "Tamil", "community": "Tamil", "date_of_birth": "1998-04-10", "place_of_birth": "Chennai"}'::jsonb,
     'Looking for a traditional yet modern partner. Family values are important to me. Love music and arts.',
     true, true, true, true, true, true, true, true),
    (user_05, 'Test User 05', 25, 'Male', 'Self',
     '["https://example.com/male_05_photo1.jpg", "https://example.com/male_05_photo2.jpg", "https://example.com/male_05_photo3.jpg"]'::jsonb,
     '{"height_cm": 185, "height_unit": "cm", "complexion": "Fair", "body_type": "Athletic", "diet": "Non-vegetarian", "smoker": false, "drinker": "Socially", "marital_status": "Never married"}'::jsonb,
     '{"highest_education": "Bachelors", "college": "Sports University", "job_title": "Fitness Trainer", "company": "Gym Chain", "annual_income": "5-8 Lakhs", "work_location": {"city": "Pune", "state": "Maharashtra", "country": "India"}}'::jsonb,
     '{"family_type": "Nuclear", "family_values": "Modern", "father_occupation": "Service", "mother_occupation": "Service", "brothers": 1, "sisters": 0, "siblings_married": "Yes"}'::jsonb,
     '{"religion": "Hindu", "mother_tongue": "Marathi", "community": "Marathi", "date_of_birth": "1999-05-15", "place_of_birth": "Pune"}'::jsonb,
     'Fitness enthusiast seeking an active and health-conscious partner. Believe in living life to the fullest.',
     true, true, true, true, true, true, true, true),
    (user_06, 'Test User 06', 24, 'Male', 'Self',
     '["https://example.com/male_06_photo1.jpg", "https://example.com/male_06_photo2.jpg", "https://example.com/male_06_photo3.jpg"]'::jsonb,
     '{"height_cm": 170, "height_unit": "cm", "complexion": "Fair", "body_type": "Slim", "diet": "Vegetarian", "smoker": false, "drinker": "Never", "marital_status": "Never married"}'::jsonb,
     '{"highest_education": "Masters", "college": "JNU", "job_title": "Content Writer", "company": "Media House", "annual_income": "6-9 Lakhs", "work_location": {"city": "Delhi", "state": "Delhi", "country": "India"}}'::jsonb,
     '{"family_type": "Joint", "family_values": "Traditional", "father_occupation": "Teacher", "mother_occupation": "Teacher", "brothers": 0, "sisters": 1, "siblings_married": "No"}'::jsonb,
     '{"religion": "Hindu", "mother_tongue": "Hindi", "community": "Brahmin", "date_of_birth": "2000-06-20", "place_of_birth": "Delhi"}'::jsonb,
     'Writer and reader at heart. Looking for someone who appreciates literature and intellectual conversations.',
     true, true, true, true, true, true, true, true),
    (user_07, 'Test User 07', 30, 'Male', 'Self',
     '["https://example.com/male_07_photo1.jpg", "https://example.com/male_07_photo2.jpg", "https://example.com/male_07_photo3.jpg"]'::jsonb,
     '{"height_cm": 175, "height_unit": "cm", "complexion": "Wheatish", "body_type": "Average", "diet": "Non-vegetarian", "smoker": false, "drinker": "Socially", "marital_status": "Never married"}'::jsonb,
     '{"highest_education": "Diploma", "college": "Culinary Institute", "job_title": "Chef", "company": "Restaurant Chain", "annual_income": "8-12 Lakhs", "work_location": {"city": "Goa", "state": "Goa", "country": "India"}}'::jsonb,
     '{"family_type": "Nuclear", "family_values": "Moderate", "father_occupation": "Business", "mother_occupation": "Business", "brothers": 1, "sisters": 1, "siblings_married": "Yes"}'::jsonb,
     '{"religion": "Hindu", "mother_tongue": "Konkani", "community": "Goan", "date_of_birth": "1994-07-25", "place_of_birth": "Goa"}'::jsonb,
     'Professional chef passionate about food and flavors. Seeking a partner who appreciates good food and good company.',
     true, true, true, true, true, true, true, true),
    (user_08, 'Test User 08', 31, 'Male', 'Self',
     '["https://example.com/male_08_photo1.jpg", "https://example.com/male_08_photo2.jpg", "https://example.com/male_08_photo3.jpg"]'::jsonb,
     '{"height_cm": 178, "height_unit": "cm", "complexion": "Fair", "body_type": "Slim", "diet": "Vegetarian", "smoker": false, "drinker": "Never", "marital_status": "Never married"}'::jsonb,
     '{"highest_education": "Masters", "college": "Yoga University", "job_title": "Yoga Instructor", "company": "Wellness Center", "annual_income": "6-10 Lakhs", "work_location": {"city": "Rishikesh", "state": "Uttarakhand", "country": "India"}}'::jsonb,
     '{"family_type": "Nuclear", "family_values": "Spiritual", "father_occupation": "Teacher", "mother_occupation": "Yoga Teacher", "brothers": 0, "sisters": 0, "siblings_married": "N/A"}'::jsonb,
     '{"religion": "Hindu", "mother_tongue": "Hindi", "community": "Brahmin", "date_of_birth": "1993-08-10", "place_of_birth": "Haridwar"}'::jsonb,
     'Yoga and meditation practitioner. Looking for a spiritually inclined partner who values inner peace and harmony.',
     true, true, true, true, true, true, true, true),
    (user_09, 'Test User 09', 32, 'Male', 'Self',
     '["https://example.com/male_09_photo1.jpg", "https://example.com/male_09_photo2.jpg", "https://example.com/male_09_photo3.jpg"]'::jsonb,
     '{"height_cm": 180, "height_unit": "cm", "complexion": "Fair", "body_type": "Athletic", "diet": "Non-vegetarian", "smoker": false, "drinker": "Socially", "marital_status": "Never married"}'::jsonb,
     '{"highest_education": "MBA", "college": "IIM", "job_title": "Business Consultant", "company": "Consulting Firm", "annual_income": "20-25 Lakhs", "work_location": {"city": "Gurgaon", "state": "Haryana", "country": "India"}}'::jsonb,
     '{"family_type": "Nuclear", "family_values": "Modern", "father_occupation": "Business", "mother_occupation": "Business", "brothers": 1, "sisters": 0, "siblings_married": "Yes"}'::jsonb,
     '{"religion": "Hindu", "mother_tongue": "Hindi", "community": "Punjabi", "date_of_birth": "1992-09-15", "place_of_birth": "Chandigarh"}'::jsonb,
     'Business professional seeking an educated and career-oriented partner. Value ambition and family both.',
     true, true, true, true, true, true, true, true),
    (user_10, 'Test User 10', 33, 'Male', 'Self',
     '["https://example.com/male_10_photo1.jpg", "https://example.com/male_10_photo2.jpg", "https://example.com/male_10_photo3.jpg"]'::jsonb,
     '{"height_cm": 177, "height_unit": "cm", "complexion": "Wheatish", "body_type": "Average", "diet": "Non-vegetarian", "smoker": false, "drinker": "Socially", "marital_status": "Never married"}'::jsonb,
     '{"highest_education": "Bachelors", "college": "Art College", "job_title": "Photographer", "company": "Freelance", "annual_income": "10-15 Lakhs", "work_location": {"city": "Mumbai", "state": "Maharashtra", "country": "India"}}'::jsonb,
     '{"family_type": "Nuclear", "family_values": "Moderate", "father_occupation": "Artist", "mother_occupation": "Teacher", "brothers": 0, "sisters": 1, "siblings_married": "No"}'::jsonb,
     '{"religion": "Hindu", "mother_tongue": "Marathi", "community": "Marathi", "date_of_birth": "1991-10-20", "place_of_birth": "Mumbai"}'::jsonb,
     'Professional photographer capturing life moments. Seeking a creative and understanding partner who appreciates art.',
     true, true, true, true, true, true, true, true)
  ON CONFLICT (user_id) DO UPDATE SET
    name = EXCLUDED.name,
    photos = EXCLUDED.photos,
    profile_completed = EXCLUDED.profile_completed;

  -- ============================================
  -- MATRIMONY PROFILES (test11-test20: Female)
  -- ============================================
  INSERT INTO matrimony_profile_full (user_id, name, age, gender, created_by, photos, personal, career, family, cultural, bio, step1_completed, step2_completed, step3_completed, step4_completed, step5_completed, step6_completed, step7_completed, profile_completed)
  VALUES
    (user_11, 'Test User 11', 29, 'Female', 'Self',
     '["https://example.com/female_01_photo1.jpg", "https://example.com/female_01_photo2.jpg", "https://example.com/female_01_photo3.jpg"]'::jsonb,
     '{"height_cm": 165, "height_unit": "cm", "complexion": "Fair", "body_type": "Slim", "diet": "Vegetarian", "smoker": false, "drinker": "Never", "marital_status": "Never married"}'::jsonb,
     '{"highest_education": "Masters", "college": "Art Institute", "job_title": "Graphic Designer", "company": "Design Studio", "annual_income": "8-12 Lakhs", "work_location": {"city": "Bangalore", "state": "Karnataka", "country": "India"}}'::jsonb,
     '{"family_type": "Nuclear", "family_values": "Modern", "father_occupation": "Engineer", "mother_occupation": "Teacher", "brothers": 1, "sisters": 0, "siblings_married": "Yes"}'::jsonb,
     '{"religion": "Hindu", "mother_tongue": "Hindi", "community": "Punjabi", "date_of_birth": "1995-11-15", "place_of_birth": "Delhi"}'::jsonb,
     'Creative professional with a passion for art and design. Looking for a partner who appreciates creativity and shares similar values.',
     true, true, true, true, true, true, true, true),
    (user_12, 'Test User 12', 28, 'Female', 'Self',
     '["https://example.com/female_02_photo1.jpg", "https://example.com/female_02_photo2.jpg", "https://example.com/female_02_photo3.jpg"]'::jsonb,
     '{"height_cm": 162, "height_unit": "cm", "complexion": "Fair", "body_type": "Athletic", "diet": "Vegetarian", "smoker": false, "drinker": "Never", "marital_status": "Never married"}'::jsonb,
     '{"highest_education": "Bachelors", "college": "Dance Academy", "job_title": "Dance Instructor", "company": "Dance Studio", "annual_income": "6-9 Lakhs", "work_location": {"city": "Mumbai", "state": "Maharashtra", "country": "India"}}'::jsonb,
     '{"family_type": "Nuclear", "family_values": "Traditional", "father_occupation": "Business", "mother_occupation": "Homemaker", "brothers": 0, "sisters": 1, "siblings_married": "No"}'::jsonb,
     '{"religion": "Hindu", "mother_tongue": "Marathi", "community": "Marathi", "date_of_birth": "1996-12-20", "place_of_birth": "Mumbai"}'::jsonb,
     'Professional dancer and fitness enthusiast. Seeking a partner who values health, fitness, and an active lifestyle.',
     true, true, true, true, true, true, true, true),
    (user_13, 'Test User 13', 27, 'Female', 'Self',
     '["https://example.com/female_03_photo1.jpg", "https://example.com/female_03_photo2.jpg", "https://example.com/female_03_photo3.jpg"]'::jsonb,
     '{"height_cm": 160, "height_unit": "cm", "complexion": "Fair", "body_type": "Slim", "diet": "Vegetarian", "smoker": false, "drinker": "Never", "marital_status": "Never married"}'::jsonb,
     '{"highest_education": "Masters", "college": "IIT", "job_title": "Software Developer", "company": "Tech Company", "annual_income": "12-18 Lakhs", "work_location": {"city": "Bangalore", "state": "Karnataka", "country": "India"}}'::jsonb,
     '{"family_type": "Nuclear", "family_values": "Moderate", "father_occupation": "Engineer", "mother_occupation": "Doctor", "brothers": 1, "sisters": 0, "siblings_married": "Yes"}'::jsonb,
     '{"religion": "Hindu", "mother_tongue": "Kannada", "community": "Kannadiga", "date_of_birth": "1997-01-25", "place_of_birth": "Bangalore"}'::jsonb,
     'Tech professional with a love for coding and problem-solving. Looking for an educated and understanding life partner.',
     true, true, true, true, true, true, true, true),
    (user_14, 'Test User 14', 26, 'Female', 'Self',
     '["https://example.com/female_04_photo1.jpg", "https://example.com/female_04_photo2.jpg", "https://example.com/female_04_photo3.jpg"]'::jsonb,
     '{"height_cm": 168, "height_unit": "cm", "complexion": "Wheatish", "body_type": "Average", "diet": "Non-vegetarian", "smoker": false, "drinker": "Socially", "marital_status": "Never married"}'::jsonb,
     '{"highest_education": "Masters", "college": "Journalism College", "job_title": "Travel Blogger", "company": "Freelance", "annual_income": "10-15 Lakhs", "work_location": {"city": "Goa", "state": "Goa", "country": "India"}}'::jsonb,
     '{"family_type": "Nuclear", "family_values": "Modern", "father_occupation": "Business", "mother_occupation": "Business", "brothers": 1, "sisters": 1, "siblings_married": "Partial"}'::jsonb,
     '{"religion": "Hindu", "mother_tongue": "Hindi", "community": "Punjabi", "date_of_birth": "1998-02-10", "place_of_birth": "Delhi"}'::jsonb,
     'Travel blogger and adventure seeker. Looking for a partner who loves exploring new places and creating memories together.',
     true, true, true, true, true, true, true, true),
    (user_15, 'Test User 15', 25, 'Female', 'Self',
     '["https://example.com/female_05_photo1.jpg", "https://example.com/female_05_photo2.jpg", "https://example.com/female_05_photo3.jpg"]'::jsonb,
     '{"height_cm": 163, "height_unit": "cm", "complexion": "Fair", "body_type": "Average", "diet": "Vegetarian", "smoker": false, "drinker": "Never", "marital_status": "Never married"}'::jsonb,
     '{"highest_education": "Diploma", "college": "Culinary School", "job_title": "Chef", "company": "Restaurant", "annual_income": "7-10 Lakhs", "work_location": {"city": "Mumbai", "state": "Maharashtra", "country": "India"}}'::jsonb,
     '{"family_type": "Nuclear", "family_values": "Traditional", "father_occupation": "Business", "mother_occupation": "Homemaker", "brothers": 0, "sisters": 2, "siblings_married": "No"}'::jsonb,
     '{"religion": "Hindu", "mother_tongue": "Marathi", "community": "Marathi", "date_of_birth": "1999-03-15", "place_of_birth": "Mumbai"}'::jsonb,
     'Professional chef passionate about cooking and creating delicious meals. Seeking a partner who appreciates good food and family time.',
     true, true, true, true, true, true, true, true),
    (user_16, 'Test User 16', 24, 'Female', 'Self',
     '["https://example.com/female_06_photo1.jpg", "https://example.com/female_06_photo2.jpg", "https://example.com/female_06_photo3.jpg"]'::jsonb,
     '{"height_cm": 158, "height_unit": "cm", "complexion": "Fair", "body_type": "Slim", "diet": "Vegetarian", "smoker": false, "drinker": "Never", "marital_status": "Never married"}'::jsonb,
     '{"highest_education": "Masters", "college": "Yoga University", "job_title": "Yoga Instructor", "company": "Wellness Center", "annual_income": "6-9 Lakhs", "work_location": {"city": "Rishikesh", "state": "Uttarakhand", "country": "India"}}'::jsonb,
     '{"family_type": "Nuclear", "family_values": "Spiritual", "father_occupation": "Teacher", "mother_occupation": "Yoga Teacher", "brothers": 0, "sisters": 0, "siblings_married": "N/A"}'::jsonb,
     '{"religion": "Hindu", "mother_tongue": "Hindi", "community": "Brahmin", "date_of_birth": "2000-04-20", "place_of_birth": "Haridwar"}'::jsonb,
     'Yoga and wellness instructor. Looking for a spiritually inclined partner who values peace, harmony, and healthy living.',
     true, true, true, true, true, true, true, true),
    (user_17, 'Test User 17', 30, 'Female', 'Self',
     '["https://example.com/female_07_photo1.jpg", "https://example.com/female_07_photo2.jpg", "https://example.com/female_07_photo3.jpg"]'::jsonb,
     '{"height_cm": 165, "height_unit": "cm", "complexion": "Fair", "body_type": "Average", "diet": "Vegetarian", "smoker": false, "drinker": "Never", "marital_status": "Never married"}'::jsonb,
     '{"highest_education": "Masters", "college": "Music Academy", "job_title": "Musician", "company": "Freelance", "annual_income": "8-12 Lakhs", "work_location": {"city": "Mumbai", "state": "Maharashtra", "country": "India"}}'::jsonb,
     '{"family_type": "Nuclear", "family_values": "Modern", "father_occupation": "Musician", "mother_occupation": "Teacher", "brothers": 1, "sisters": 0, "siblings_married": "Yes"}'::jsonb,
     '{"religion": "Hindu", "mother_tongue": "Marathi", "community": "Marathi", "date_of_birth": "1994-05-25", "place_of_birth": "Mumbai"}'::jsonb,
     'Professional musician and singer. Seeking a partner who appreciates music and shares a love for the arts.',
     true, true, true, true, true, true, true, true),
    (user_18, 'Test User 18', 31, 'Female', 'Self',
     '["https://example.com/female_08_photo1.jpg", "https://example.com/female_08_photo2.jpg", "https://example.com/female_08_photo3.jpg"]'::jsonb,
     '{"height_cm": 162, "height_unit": "cm", "complexion": "Fair", "body_type": "Slim", "diet": "Vegetarian", "smoker": false, "drinker": "Never", "marital_status": "Never married"}'::jsonb,
     '{"highest_education": "MBBS", "college": "Medical College", "job_title": "Doctor", "company": "Hospital", "annual_income": "15-20 Lakhs", "work_location": {"city": "Delhi", "state": "Delhi", "country": "India"}}'::jsonb,
     '{"family_type": "Nuclear", "family_values": "Traditional", "father_occupation": "Doctor", "mother_occupation": "Doctor", "brothers": 1, "sisters": 0, "siblings_married": "Yes"}'::jsonb,
     '{"religion": "Hindu", "mother_tongue": "Hindi", "community": "Punjabi", "date_of_birth": "1993-06-10", "place_of_birth": "Delhi"}'::jsonb,
     'Medical professional dedicated to helping others. Looking for an educated and caring partner who values family and service.',
     true, true, true, true, true, true, true, true),
    (user_19, 'Test User 19', 32, 'Female', 'Self',
     '["https://example.com/female_09_photo1.jpg", "https://example.com/female_09_photo2.jpg", "https://example.com/female_09_photo3.jpg"]'::jsonb,
     '{"height_cm": 164, "height_unit": "cm", "complexion": "Wheatish", "body_type": "Average", "diet": "Non-vegetarian", "smoker": false, "drinker": "Socially", "marital_status": "Never married"}'::jsonb,
     '{"highest_education": "MBA", "college": "Business School", "job_title": "Marketing Manager", "company": "Marketing Agency", "annual_income": "12-18 Lakhs", "work_location": {"city": "Mumbai", "state": "Maharashtra", "country": "India"}}'::jsonb,
     '{"family_type": "Nuclear", "family_values": "Modern", "father_occupation": "Business", "mother_occupation": "Business", "brothers": 0, "sisters": 1, "siblings_married": "No"}'::jsonb,
     '{"religion": "Hindu", "mother_tongue": "Marathi", "community": "Marathi", "date_of_birth": "1992-07-15", "place_of_birth": "Mumbai"}'::jsonb,
     'Marketing professional with a passion for connecting with people. Seeking a career-oriented and understanding partner.',
     true, true, true, true, true, true, true, true),
    (user_20, 'Test User 20', 33, 'Female', 'Self',
     '["https://example.com/female_10_photo1.jpg", "https://example.com/female_10_photo2.jpg", "https://example.com/female_10_photo3.jpg"]'::jsonb,
     '{"height_cm": 160, "height_unit": "cm", "complexion": "Fair", "body_type": "Slim", "diet": "Vegetarian", "smoker": false, "drinker": "Never", "marital_status": "Never married"}'::jsonb,
     '{"highest_education": "Masters", "college": "Education University", "job_title": "Teacher", "company": "School", "annual_income": "6-10 Lakhs", "work_location": {"city": "Delhi", "state": "Delhi", "country": "India"}}'::jsonb,
     '{"family_type": "Joint", "family_values": "Traditional", "father_occupation": "Teacher", "mother_occupation": "Teacher", "brothers": 1, "sisters": 1, "siblings_married": "Partial"}'::jsonb,
     '{"religion": "Hindu", "mother_tongue": "Hindi", "community": "Brahmin", "date_of_birth": "1991-08-20", "place_of_birth": "Delhi"}'::jsonb,
     'Dedicated teacher and lifelong learner. Looking for an educated and family-oriented partner who values education and growth.',
     true, true, true, true, true, true, true, true)
  ON CONFLICT (user_id) DO UPDATE SET
    name = EXCLUDED.name,
    photos = EXCLUDED.photos,
    profile_completed = EXCLUDED.profile_completed;

END $$;

