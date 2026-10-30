CREATE OR REPLACE FUNCTION create_profile_and_workspace() 
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    random_username TEXT;
BEGIN
    -- Generate a random username
    random_username := 'user' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 16);

    -- Create a profile for the new user
    INSERT INTO public.profiles(user_id, anthropic_api_key, azure_openai_35_turbo_id, azure_openai_45_turbo_id, azure_openai_45_vision_id, azure_openai_api_key, azure_openai_endpoint, google_gemini_api_key, has_onboarded, image_url, image_path, mistral_api_key, display_name, bio, openai_api_key, openai_organization_id, perplexity_api_key, profile_context, use_azure_openai, username)
    VALUES(
        NEW.id,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        TRUE,
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        FALSE,
        random_username
    ) ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO public.workspaces(user_id, is_home, name, default_context_length, default_model, default_prompt, default_temperature, description, embeddings_provider, include_profile_context, include_workspace_instructions, instructions)
    VALUES(
        NEW.id,
        TRUE,
        'Home',
        4096,
        'gemini-3.5-flash-lite',
        'You are a friendly, helpful AI assistant.',
        0.5,
        'My home workspace.',
        'openai',
        TRUE,
        TRUE,
        ''
    ) ON CONFLICT (user_id) WHERE is_home DO NOTHING;

    RETURN NEW;
END;
$$;

-- Repair only the caller's account; never accept a user id from the browser.
CREATE OR REPLACE FUNCTION public.ensure_nutricare_account()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
  workspace_id uuid;
BEGIN
  IF caller IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '28000';
  END IF;
  INSERT INTO public.profiles (user_id, bio, has_onboarded, image_url, image_path,
    profile_context, display_name, use_azure_openai, username)
  VALUES (caller, '', true, '', '', '', '', false,
    'user' || substr(replace(caller::text, '-', ''), 1, 20))
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.profiles SET has_onboarded = true WHERE user_id = caller AND NOT has_onboarded;
  INSERT INTO public.workspaces (user_id, is_home, name, default_context_length,
    default_model, default_prompt, default_temperature, description,
    embeddings_provider, include_profile_context, include_workspace_instructions, instructions)
  VALUES (caller, true, 'NutriCare', 8192, 'gemini-3.5-flash-lite',
    'İlaç ve beslenme sorularına anlaşılır, kaynaklara dayalı yanıt ver.',
    0.3, 'NutriCare kişisel çalışma alanı', 'openai', true, true, '')
  ON CONFLICT (user_id) WHERE is_home DO NOTHING;
  SELECT id INTO workspace_id FROM public.workspaces WHERE user_id = caller AND is_home;
  RETURN workspace_id;
END;
$$;
REVOKE ALL ON FUNCTION public.ensure_nutricare_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ensure_nutricare_account() TO authenticated;

UPDATE public.workspaces SET default_model = 'gemini-3.5-flash-lite'
WHERE default_model IN ('gpt-4.1-mini', 'gpt-4-1106-preview', 'gpt-4-turbo-preview', 'gemini-pro', 'gemini-pro-vision', 'gemini-1.5-flash', 'gemini-1.5-pro-latest');
