-- =============================================
-- Script d'insertion d'un utilisateur de test
-- =============================================
-- Email: sana.amkar@ammps.gov.ma
-- Mot de passe: test123
-- =============================================

-- Insérer l'utilisateur dans auth.users (Supabase Auth)
-- Le mot de passe 'test123' est hashé automatiquement avec la fonction crypt()

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
    'sana.amkar@ammps.gov.ma',
    crypt('test123', gen_salt('bf')),
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

-- =============================================
-- RÉSULTAT
-- =============================================
-- Utilisateur créé avec succès:
-- ID: dbe918e0-2005-40ea-924f-238b2c138f18
-- Email: sana.amkar@ammps.gov.ma
-- Mot de passe: test123
-- =============================================
