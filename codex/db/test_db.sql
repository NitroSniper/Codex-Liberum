-- Adminer 5.1.0 PostgreSQL 17.4 dump

DROP TABLE IF EXISTS "posts";
DROP SEQUENCE IF EXISTS post_id_seq;
CREATE SEQUENCE post_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."posts" (
                                  "id" integer DEFAULT nextval('post_id_seq') NOT NULL,
                                  "title" character varying(255) NOT NULL,
                                  "content" text NOT NULL,
                                  "created" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                                  CONSTRAINT "post_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

INSERT INTO "posts" ("id", "title", "content", "created") VALUES
                                                              (1,	'Israel admits mistakes over medic killings in Gaza',	'Israel''s army has admitted its soldiers made mistakes over the killing of 15 emergency workers in southern Gaza on 23 March – but says some of them were linked to Hamas.

The convoy of Palestinian Red Crescent Society (PRCS) ambulances, a UN car and a fire truck from Gaza''s Civil Defence came under fire near Rafah.

Israel originally claimed troops opened fire because the convoy approached "suspiciously" in darkness without headlights or flashing lights. Movement of the vehicles had not been previously co-ordinated or agreed with the army.

Mobile phone footage, filmed by one of the paramedics who was killed, showed the vehicles did have lights on as they answered a call to help wounded people.

The video, originally shared by the New York Times, shows the vehicles pulling up on the road when, without warning, shooting begins just before dawn.

The footage continues for more than five minutes, with the paramedic, named as Refat Radwan, heard saying his last prayers before the voices of Israeli soldiers are heard approaching the vehicles.

An Israel Defense Forces (IDF) official briefed journalists on Saturday evening, saying the soldiers had earlier fired on a car containing three Hamas members.

When the ambulances responded and approached the area, aerial surveillance monitors informed the soldiers on the ground of the convoy "advancing suspiciously".',	'2025-04-05 23:20:11.435585'),
                                                              (2,	'Trump''s agenda grapples with political and economic reality',	'Donald Trump, in announcing his sweeping new tariffs on US imports on Wednesday, promised that the history books would record 2 April as America''s "liberation day".

After two days of stock market turmoil, however, this may also be remembered as the week the president''s second-term agenda ran headfirst into economic - and political - reality.

US stocks have been in a tailspin since Trump unveiled his tariffs at Wednesday afternoon''s White House Rose Garden event, with signs that America''s trading partners - Canada, the European Union and China, most notably - are not backing away from a fight.',	'2025-04-05 23:20:51.777352'),
                                                              (3,	'''Don''t speak, don''t film'': Journalist arrests fuel fears for democracy after Turkey protests',	'It was early morning on 23 March when the police came to Yasin Akgul''s door in Istanbul – while his children were still in bed. Just hours before, the Turkish photojournalist had returned home from covering mass anti-government protests. Now he was a wanted man.

"I went to the door and saw there was a lot of police," he says. "They said they had an arrest order for me but gave me no details. My son was awake, and I couldn''t even tell him what was happening as I didn''t get it myself."

Akgul, 35, has seen "plenty of action" in more than a decade as a photojournalist with the AFP news agency – from war-torn Syria to IS-controlled Iraq. On home soil in Turkey, he has been beaten by the police several times while taking pictures, he says - including on World Peace Day – and has been detained "so many times".',	'2025-04-05 23:21:37.826997');

DROP TABLE IF EXISTS "users";
DROP SEQUENCE IF EXISTS users_id_seq;
CREATE SEQUENCE users_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."users" (
                                  "id" integer DEFAULT nextval('users_id_seq') NOT NULL,
                                  "username" character varying(50) NOT NULL,
                                  "hashed_password" text NOT NULL,
                                  "salt" text NOT NULL,
                                  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
) WITH (oids = false);

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);


-- 2025-04-06 00:43:49 UTC