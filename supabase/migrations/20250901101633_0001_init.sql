create sequence "public"."messages_id_seq";


  create table "public"."chat_attachments" (
    "id" uuid not null default uuid_generate_v4(),
    "chat_id" uuid not null,
    "user_id" uuid not null,
    "file_url" text not null,
    "file_name" text,
    "file_type" text,
    "file_size" integer,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."chat_attachments" enable row level security;


  create table "public"."chats" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "project_id" uuid,
    "title" text,
    "model" text,
    "system_prompt" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "public" boolean not null default false
      );


alter table "public"."chats" enable row level security;


  create table "public"."feedback" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "message" text not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."feedback" enable row level security;


  create table "public"."messages" (
    "id" integer not null default nextval('messages_id_seq'::regclass),
    "chat_id" uuid not null,
    "user_id" uuid,
    "content" text,
    "role" text not null,
    "experimental_attachments" jsonb,
    "parts" jsonb,
    "created_at" timestamp with time zone default now(),
    "message_group_id" text,
    "model" text
      );


alter table "public"."messages" enable row level security;


  create table "public"."projects" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "user_id" uuid not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."projects" enable row level security;


  create table "public"."user_keys" (
    "user_id" uuid not null,
    "provider" text not null,
    "encrypted_key" text not null,
    "iv" text not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."user_keys" enable row level security;


  create table "public"."user_preferences" (
    "user_id" uuid not null,
    "layout" text default 'fullscreen'::text,
    "prompt_suggestions" boolean default true,
    "show_tool_invocations" boolean default true,
    "show_conversation_previews" boolean default true,
    "multi_model_enabled" boolean default false,
    "hidden_models" text[] default '{}'::text[],
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."user_preferences" enable row level security;


  create table "public"."users" (
    "id" uuid not null,
    "email" text,
    "anonymous" boolean,
    "daily_message_count" integer,
    "daily_reset" timestamp with time zone,
    "display_name" text,
    "favorite_models" text[],
    "message_count" integer,
    "premium" boolean,
    "profile_image" text,
    "created_at" timestamp with time zone default now(),
    "last_active_at" timestamp with time zone default now(),
    "daily_pro_message_count" integer,
    "daily_pro_reset" timestamp with time zone,
    "system_prompt" text
      );


alter table "public"."users" enable row level security;

alter sequence "public"."messages_id_seq" owned by "public"."messages"."id";

CREATE UNIQUE INDEX chat_attachments_pkey ON public.chat_attachments USING btree (id);

CREATE UNIQUE INDEX chats_pkey ON public.chats USING btree (id);

CREATE UNIQUE INDEX feedback_pkey ON public.feedback USING btree (id);

CREATE UNIQUE INDEX messages_pkey ON public.messages USING btree (id);

CREATE UNIQUE INDEX projects_pkey ON public.projects USING btree (id);

CREATE UNIQUE INDEX user_keys_pkey ON public.user_keys USING btree (user_id, provider);

CREATE UNIQUE INDEX user_preferences_pkey ON public.user_preferences USING btree (user_id);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."chat_attachments" add constraint "chat_attachments_pkey" PRIMARY KEY using index "chat_attachments_pkey";

alter table "public"."chats" add constraint "chats_pkey" PRIMARY KEY using index "chats_pkey";

alter table "public"."feedback" add constraint "feedback_pkey" PRIMARY KEY using index "feedback_pkey";

alter table "public"."messages" add constraint "messages_pkey" PRIMARY KEY using index "messages_pkey";

alter table "public"."projects" add constraint "projects_pkey" PRIMARY KEY using index "projects_pkey";

alter table "public"."user_keys" add constraint "user_keys_pkey" PRIMARY KEY using index "user_keys_pkey";

alter table "public"."user_preferences" add constraint "user_preferences_pkey" PRIMARY KEY using index "user_preferences_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."chat_attachments" add constraint "chat_attachments_chat_id_fkey" FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE not valid;

alter table "public"."chat_attachments" validate constraint "chat_attachments_chat_id_fkey";

alter table "public"."chat_attachments" add constraint "chat_attachments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."chat_attachments" validate constraint "chat_attachments_user_id_fkey";

alter table "public"."chats" add constraint "chats_project_id_fkey" FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE not valid;

alter table "public"."chats" validate constraint "chats_project_id_fkey";

alter table "public"."chats" add constraint "chats_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."chats" validate constraint "chats_user_id_fkey";

alter table "public"."feedback" add constraint "feedback_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."feedback" validate constraint "feedback_user_id_fkey";

alter table "public"."messages" add constraint "messages_chat_id_fkey" FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_chat_id_fkey";

alter table "public"."messages" add constraint "messages_role_check" CHECK ((role = ANY (ARRAY['system'::text, 'user'::text, 'assistant'::text, 'data'::text]))) not valid;

alter table "public"."messages" validate constraint "messages_role_check";

alter table "public"."messages" add constraint "messages_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_user_id_fkey";

alter table "public"."projects" add constraint "projects_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."projects" validate constraint "projects_user_id_fkey";

alter table "public"."user_keys" add constraint "user_keys_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."user_keys" validate constraint "user_keys_user_id_fkey";

alter table "public"."user_preferences" add constraint "user_preferences_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."user_preferences" validate constraint "user_preferences_user_id_fkey";

alter table "public"."users" add constraint "users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "users_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.users (id, email, anonymous, display_name)
  values (new.id, new.email, coalesce(new.is_anonymous, false), 
          coalesce((new.raw_user_meta_data->>'display_name'), 'Guest'));
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_user_preferences_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;

grant delete on table "public"."chat_attachments" to "anon";

grant insert on table "public"."chat_attachments" to "anon";

grant references on table "public"."chat_attachments" to "anon";

grant select on table "public"."chat_attachments" to "anon";

grant trigger on table "public"."chat_attachments" to "anon";

grant truncate on table "public"."chat_attachments" to "anon";

grant update on table "public"."chat_attachments" to "anon";

grant delete on table "public"."chat_attachments" to "authenticated";

grant insert on table "public"."chat_attachments" to "authenticated";

grant references on table "public"."chat_attachments" to "authenticated";

grant select on table "public"."chat_attachments" to "authenticated";

grant trigger on table "public"."chat_attachments" to "authenticated";

grant truncate on table "public"."chat_attachments" to "authenticated";

grant update on table "public"."chat_attachments" to "authenticated";

grant delete on table "public"."chat_attachments" to "service_role";

grant insert on table "public"."chat_attachments" to "service_role";

grant references on table "public"."chat_attachments" to "service_role";

grant select on table "public"."chat_attachments" to "service_role";

grant trigger on table "public"."chat_attachments" to "service_role";

grant truncate on table "public"."chat_attachments" to "service_role";

grant update on table "public"."chat_attachments" to "service_role";

grant delete on table "public"."chats" to "anon";

grant insert on table "public"."chats" to "anon";

grant references on table "public"."chats" to "anon";

grant select on table "public"."chats" to "anon";

grant trigger on table "public"."chats" to "anon";

grant truncate on table "public"."chats" to "anon";

grant update on table "public"."chats" to "anon";

grant delete on table "public"."chats" to "authenticated";

grant insert on table "public"."chats" to "authenticated";

grant references on table "public"."chats" to "authenticated";

grant select on table "public"."chats" to "authenticated";

grant trigger on table "public"."chats" to "authenticated";

grant truncate on table "public"."chats" to "authenticated";

grant update on table "public"."chats" to "authenticated";

grant delete on table "public"."chats" to "service_role";

grant insert on table "public"."chats" to "service_role";

grant references on table "public"."chats" to "service_role";

grant select on table "public"."chats" to "service_role";

grant trigger on table "public"."chats" to "service_role";

grant truncate on table "public"."chats" to "service_role";

grant update on table "public"."chats" to "service_role";

grant delete on table "public"."feedback" to "anon";

grant insert on table "public"."feedback" to "anon";

grant references on table "public"."feedback" to "anon";

grant select on table "public"."feedback" to "anon";

grant trigger on table "public"."feedback" to "anon";

grant truncate on table "public"."feedback" to "anon";

grant update on table "public"."feedback" to "anon";

grant delete on table "public"."feedback" to "authenticated";

grant insert on table "public"."feedback" to "authenticated";

grant references on table "public"."feedback" to "authenticated";

grant select on table "public"."feedback" to "authenticated";

grant trigger on table "public"."feedback" to "authenticated";

grant truncate on table "public"."feedback" to "authenticated";

grant update on table "public"."feedback" to "authenticated";

grant delete on table "public"."feedback" to "service_role";

grant insert on table "public"."feedback" to "service_role";

grant references on table "public"."feedback" to "service_role";

grant select on table "public"."feedback" to "service_role";

grant trigger on table "public"."feedback" to "service_role";

grant truncate on table "public"."feedback" to "service_role";

grant update on table "public"."feedback" to "service_role";

grant delete on table "public"."messages" to "anon";

grant insert on table "public"."messages" to "anon";

grant references on table "public"."messages" to "anon";

grant select on table "public"."messages" to "anon";

grant trigger on table "public"."messages" to "anon";

grant truncate on table "public"."messages" to "anon";

grant update on table "public"."messages" to "anon";

grant delete on table "public"."messages" to "authenticated";

grant insert on table "public"."messages" to "authenticated";

grant references on table "public"."messages" to "authenticated";

grant select on table "public"."messages" to "authenticated";

grant trigger on table "public"."messages" to "authenticated";

grant truncate on table "public"."messages" to "authenticated";

grant update on table "public"."messages" to "authenticated";

grant delete on table "public"."messages" to "service_role";

grant insert on table "public"."messages" to "service_role";

grant references on table "public"."messages" to "service_role";

grant select on table "public"."messages" to "service_role";

grant trigger on table "public"."messages" to "service_role";

grant truncate on table "public"."messages" to "service_role";

grant update on table "public"."messages" to "service_role";

grant delete on table "public"."projects" to "anon";

grant insert on table "public"."projects" to "anon";

grant references on table "public"."projects" to "anon";

grant select on table "public"."projects" to "anon";

grant trigger on table "public"."projects" to "anon";

grant truncate on table "public"."projects" to "anon";

grant update on table "public"."projects" to "anon";

grant delete on table "public"."projects" to "authenticated";

grant insert on table "public"."projects" to "authenticated";

grant references on table "public"."projects" to "authenticated";

grant select on table "public"."projects" to "authenticated";

grant trigger on table "public"."projects" to "authenticated";

grant truncate on table "public"."projects" to "authenticated";

grant update on table "public"."projects" to "authenticated";

grant delete on table "public"."projects" to "service_role";

grant insert on table "public"."projects" to "service_role";

grant references on table "public"."projects" to "service_role";

grant select on table "public"."projects" to "service_role";

grant trigger on table "public"."projects" to "service_role";

grant truncate on table "public"."projects" to "service_role";

grant update on table "public"."projects" to "service_role";

grant delete on table "public"."user_keys" to "anon";

grant insert on table "public"."user_keys" to "anon";

grant references on table "public"."user_keys" to "anon";

grant select on table "public"."user_keys" to "anon";

grant trigger on table "public"."user_keys" to "anon";

grant truncate on table "public"."user_keys" to "anon";

grant update on table "public"."user_keys" to "anon";

grant delete on table "public"."user_keys" to "authenticated";

grant insert on table "public"."user_keys" to "authenticated";

grant references on table "public"."user_keys" to "authenticated";

grant select on table "public"."user_keys" to "authenticated";

grant trigger on table "public"."user_keys" to "authenticated";

grant truncate on table "public"."user_keys" to "authenticated";

grant update on table "public"."user_keys" to "authenticated";

grant delete on table "public"."user_keys" to "service_role";

grant insert on table "public"."user_keys" to "service_role";

grant references on table "public"."user_keys" to "service_role";

grant select on table "public"."user_keys" to "service_role";

grant trigger on table "public"."user_keys" to "service_role";

grant truncate on table "public"."user_keys" to "service_role";

grant update on table "public"."user_keys" to "service_role";

grant delete on table "public"."user_preferences" to "anon";

grant insert on table "public"."user_preferences" to "anon";

grant references on table "public"."user_preferences" to "anon";

grant select on table "public"."user_preferences" to "anon";

grant trigger on table "public"."user_preferences" to "anon";

grant truncate on table "public"."user_preferences" to "anon";

grant update on table "public"."user_preferences" to "anon";

grant delete on table "public"."user_preferences" to "authenticated";

grant insert on table "public"."user_preferences" to "authenticated";

grant references on table "public"."user_preferences" to "authenticated";

grant select on table "public"."user_preferences" to "authenticated";

grant trigger on table "public"."user_preferences" to "authenticated";

grant truncate on table "public"."user_preferences" to "authenticated";

grant update on table "public"."user_preferences" to "authenticated";

grant delete on table "public"."user_preferences" to "service_role";

grant insert on table "public"."user_preferences" to "service_role";

grant references on table "public"."user_preferences" to "service_role";

grant select on table "public"."user_preferences" to "service_role";

grant trigger on table "public"."user_preferences" to "service_role";

grant truncate on table "public"."user_preferences" to "service_role";

grant update on table "public"."user_preferences" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";


  create policy "tmp_all_read_attach"
  on "public"."chat_attachments"
  as permissive
  for select
  to authenticated
using (true);



  create policy "tmp_all_write_attach"
  on "public"."chat_attachments"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "tmp_all_read_chats"
  on "public"."chats"
  as permissive
  for select
  to authenticated
using (true);



  create policy "tmp_all_write_chats"
  on "public"."chats"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "tmp_all_read_feedback"
  on "public"."feedback"
  as permissive
  for select
  to authenticated
using (true);



  create policy "tmp_all_write_feedback"
  on "public"."feedback"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "tmp_all_read_messages"
  on "public"."messages"
  as permissive
  for select
  to authenticated
using (true);



  create policy "tmp_all_write_messages"
  on "public"."messages"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "tmp_all_read_projects"
  on "public"."projects"
  as permissive
  for select
  to authenticated
using (true);



  create policy "tmp_all_write_projects"
  on "public"."projects"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "tmp_all_read_keys"
  on "public"."user_keys"
  as permissive
  for select
  to authenticated
using (true);



  create policy "tmp_all_write_keys"
  on "public"."user_keys"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "tmp_all_read_prefs"
  on "public"."user_preferences"
  as permissive
  for select
  to authenticated
using (true);



  create policy "tmp_all_write_prefs"
  on "public"."user_preferences"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "tmp_all_read_users"
  on "public"."users"
  as permissive
  for select
  to authenticated
using (true);



  create policy "tmp_all_write_users"
  on "public"."users"
  as permissive
  for all
  to authenticated
using (true)
with check (true);


CREATE TRIGGER update_user_preferences_timestamp BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION update_user_preferences_updated_at();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();


  create policy "tmp all read avatars"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'avatars'::text));



  create policy "tmp all read chat-attachments"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'chat-attachments'::text));



  create policy "tmp all write avatars"
  on "storage"."objects"
  as permissive
  for all
  to authenticated
using ((bucket_id = 'avatars'::text))
with check ((bucket_id = 'avatars'::text));



  create policy "tmp all write chat-attachments"
  on "storage"."objects"
  as permissive
  for all
  to authenticated
using ((bucket_id = 'chat-attachments'::text))
with check ((bucket_id = 'chat-attachments'::text));



