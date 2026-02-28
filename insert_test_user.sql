-- =============================================
-- UTILISATEUR DE TEST DÉJÀ CRÉÉ
-- =============================================
-- Email: sana.amkar@ammps.gov.ma
-- Mot de passe: test123
-- ID: dbe918e0-2005-40ea-924f-238b2c138f18
-- Statut: ACTIF ET PRÊT À UTILISER
-- =============================================

-- L'utilisateur a déjà été créé dans la base de données Supabase.
-- Vous pouvez vous connecter immédiatement avec ces identifiants:
--   Email: sana.amkar@ammps.gov.ma
--   Mot de passe: test123

-- Pour vérifier l'utilisateur:
SELECT id, email, created_at
FROM auth.users
WHERE email = 'sana.amkar@ammps.gov.ma';

-- =============================================
-- NOTES IMPORTANTES
-- =============================================
-- 1. L'utilisateur existe dans auth.users (table d'authentification Supabase)
-- 2. Le mot de passe est hashé de manière sécurisée
-- 3. Vous pouvez vous connecter directement à l'application
-- 4. Si vous devez créer un autre utilisateur, utilisez le script ci-dessous

/*
-- SCRIPT POUR CRÉER UN NOUVEL UTILISATEUR
-- Remplacez l'email et le mot de passe selon vos besoins

INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud,
    is_sso_user,
    is_anonymous
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'VOTRE_EMAIL@exemple.com',  -- Changez ceci
    crypt('VOTRE_MOT_DE_PASSE', gen_salt('bf')),  -- Changez ceci
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false,
    'authenticated',
    'authenticated',
    false,
    false
);
*/
