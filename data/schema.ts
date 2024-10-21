import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

// HOSPITALS
export const hospitals = sqliteTable(
    'nt_hospitals', 
    {
        id: integer('id').primaryKey(),
        hospitalId: text('hospital_id').notNull().unique(),
        oldHospitalId: text('old_hospital_id').unique(),
        name: text('name').notNull().unique(),
        country: text('country').default(''),
        
        createdAt: text('created_at').notNull(),
        updatedAt: text('updated_at').notNull(),
        deletedAt: text('deleted_at'),
    },
);

// CONFIG KEYS
export const configKeys = sqliteTable(
    'nt_config_keys', 
    {
        id: integer('id').primaryKey(),
        configKeyId: text('config_key_id').notNull().unique(),
        oldConfigKeyId: text('old_config_key_id').unique(),
        position: integer('position').notNull(),
        version: integer('version').notNull(),

        key: text('key').notNull().unique(),
        label: text('label').notNull().unique(),
        summary: text('summary').notNull(),
        source: text('source').default('editor'),
        preferences: text('preferences').default(JSON.stringify({})).notNull(), // json

        isDraft: integer('is_draft').notNull().default(0),
        
        publishDate: text('publish_date'),
        createdAt: text('created_at').notNull(),
        updatedAt: text('updated_at').notNull(),
        deletedAt: text('deleted_at'),
    },
);

// SCRIPTS
export const scripts = sqliteTable(
    'nt_scripts', 
    {
        id: integer('id').primaryKey(),
        scriptId: text('script_id').notNull().unique(),
        oldScriptId: text('old_script_id').unique(),
        version: integer('version').notNull(),

        type: text('type').notNull().default('admission'),
        position: integer('position').notNull(),
        source: text('source').default('editor'),
        title: text('title').notNull(),
        printTitle: text('print_title').notNull(),
        description: text('description').notNull().default(''),
        hospitalId: text('hospital_id'),
        exportable: integer('exportable').notNull().default(1),
        nuidSearchEnabled: integer('nuid_search_enabled').notNull().default(0),
        nuidSearchFields: text('nuid_search_fields').default('[]').notNull(), // json
        preferences: text('preferences').default(JSON.stringify({})).notNull(), // json

        isDraft: integer('is_draft').notNull().default(0),
        
        publishDate: text('publish_date'),
        createdAt: text('created_at').notNull(),
        updatedAt: text('updated_at').notNull(),
        deletedAt: text('deleted_at'),
    },
);

// SCREENS
export const screens = sqliteTable(
    'nt_screens', 
    {
        id: integer('id').primaryKey(),
        screenId: text('screen_id').notNull().unique(),
        oldScreenId: text('old_screen_id').unique(),
        oldScriptId: text('old_script_id'),
        version: integer('version').notNull(),
        scriptId: text('script_id').references(() => scripts.scriptId, { onDelete: 'cascade', }).notNull(),

        type: text('type').notNull(),
        position: integer('position').notNull(),
        source: text('source').default('editor'),
        sectionTitle: text('section_title').notNull(),
        previewTitle: text('preview_title').notNull().default(''),
        previewPrintTitle: text('preview_print_title').notNull().default(''),
        condition: text('condition').notNull().default(''),
        skipToCondition: text('skip_to_condition').notNull().default(''),
        skipToScreenId: text('skip_to_screen_id'),
        epicId: text('epic_id').notNull().default(''),
        storyId: text('story_id').notNull().default(''),
        refId: text('ref_id').notNull().default(''),
        refKey: text('ref_key').notNull().default(''),
        step: text('step').notNull().default(''),
        actionText: text('action_text').notNull().default(''),
        contentText: text('content_text').notNull().default(''),
        infoText: text('info_text').notNull().default(''),
        title: text('title').notNull(),
        title1: text('title1').notNull().default(''),
        title2: text('title2').notNull().default(''),
        title3: text('title3').notNull().default(''),
        title4: text('title4').notNull().default(''),
        text1: text('text1').notNull().default(''),
        text2: text('text2').notNull().default(''),
        text3: text('text3').notNull().default(''),
        image1: text('image1'),
        image2: text('image2'),
        image3: text('image3'),
        instructions: text('instructions').notNull().default(''),
        instructions2: text('instructions2').notNull().default(''),
        instructions3: text('instructions3').notNull().default(''),
        instructions4: text('instructions4').notNull().default(''),
        hcwDiagnosesInstructions: text('hcw_diagnoses_instructions').notNull().default(''),
        suggestedDiagnosesInstructions: text('suggested_diagnoses_instructions').notNull().default(''),
        notes: text('notes').notNull().default(''),
        dataType: text('data_type').notNull().default(''),
        key: text('key').notNull().default(''),
        label: text('label').notNull().default(''),
        negativeLabel: text('negative_label').notNull().default(''),
        positiveLabel: text('positive_label').notNull().default(''),
        timerValue: integer('timer_value'),
        multiplier: integer('multiplier'),
        minValue: integer('min_value'),
        maxValue: integer('max_value'),
        exportable: integer('exportable').notNull().default(1),
        printable: integer('printable'),
        skippable: integer('skippable').notNull().default(0),
        confidential: integer('confidential').notNull().default(0),
        prePopulate: text('pre_populate').default('[]').notNull(), // json
        fields: text('fields').default('[]').notNull(), // json
        items: text('items').default('[]').notNull(), // json
        preferences: text('preferences').default(JSON.stringify({})).notNull(), // json

        isDraft: integer('is_draft').notNull().default(0),
        
        publishDate: text('publish_date'),
        createdAt: text('created_at').notNull(),
        updatedAt: text('updated_at').notNull(),
        deletedAt: text('deleted_at'),
    },
);

// DIAGNOSES
export const diagnoses = sqliteTable(
    'nt_diagnoses', 
    {
        id: integer('id').primaryKey(),
        diagnosisId: text('diagnosis_id').notNull().unique(),
        oldDiagnosisId: text('old_diagnosis_id').unique(),
        oldScriptId: text('old_script_id'),
        version: integer('version').notNull(),
        scriptId: text('script_id').references(() => scripts.scriptId, { onDelete: 'cascade', }).notNull(),

        position: integer('position').notNull(),
        source: text('source').default('editor'),
        expression: text('expression').notNull(),
        name: text('name').notNull().default(''),
        description: text('description').notNull().default(''),
        key: text('key').default(''),
        severityOrder: integer('severity_order'),
        expressionMeaning: text('expression_meaning').notNull().default(''),
        symptoms: text('symptoms').default('[]').notNull(), // json
        text1: text('text1').notNull().default(''),
        text2: text('text2').notNull().default(''),
        text3: text('text3').notNull().default(''),
        image1: text('image1'), // json
        image2: text('image2'), // json
        image3: text('image3'), // json
        preferences: text('preferences').default(JSON.stringify({})).notNull(), // json

        isDraft: integer('is_draft').notNull().default(0),
        
        publishDate: text('publish_date'),
        createdAt: text('created_at').notNull(),
        updatedAt: text('updated_at').notNull(),
        deletedAt: text('deleted_at'),
    },
);