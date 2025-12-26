// server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { createWorker } = require('tesseract.js');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const sharp = require('sharp');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
        }
    }
});

// 🔑 PUT YOUR GEMINI API KEY HERE
const API_KEY = 'AIzaSyBget5TYaIeobkFw-trxH4KTCCD7wURY-w';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(API_KEY);
const MODEL_NAME = "gemini-2.5-flash";

let model;
try {
    model = genAI.getGenerativeModel({ model: MODEL_NAME });
    console.log(`✅ Gemini AI initialized with model: ${MODEL_NAME}`);
} catch (error) {
    console.error('❌ Failed to initialize Gemini model:', error);
}

console.log(`🔑 Using API Key: ${API_KEY.substring(0, 15)}...`);

// OCR function
async function performOCR(imageBuffer) {
    const worker = await createWorker('eng');

    try {
        const processedImage = await sharp(imageBuffer)
            .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
            .greyscale()
            .normalize()
            .toBuffer();

        const { data: { text } } = await worker.recognize(processedImage);
        return text;
    } catch (error) {
        console.error('OCR Error:', error);
        throw error;
    } finally {
        await worker.terminate();
    }
}

// Extract text from PDF
async function extractTextFromPDF(pdfBuffer) {
    try {
        const data = await pdfParse(pdfBuffer);

        if (data.text && data.text.trim().length > 0) {
            return data.text;
        }

        return "PDF appears to be image-based. Please convert to images for better results.";
    } catch (error) {
        console.error('PDF Extraction Error:', error);
        throw error;
    }
}

// Enhanced Analyze with Gemini - Personalized Nutrition Focus
async function analyzeWithGemini(reportText) {
    console.log('📊 Starting Gemini analysis for Personalized Nutrition...');

    const prompt = `You are an expert nutritionist and dietitian with extensive knowledge of medical reports and personalized nutrition. Analyze this medical report and provide COMPREHENSIVE PERSONALIZED NUTRITION RECOMMENDATIONS.

Your primary goal is to create a PERSONALIZED NUTRITION PLAN based on the health markers found in the report.

Extract all data and return in this EXACT JSON structure:

{
    "extracted_markers": {
        "TestName": {
            "value": number,
            "unit": "string",
            "status": "Low|Normal|High|Borderline",
            "reference_range": "string",
            "severity": "mild|moderate|severe",
            "explanation": "Brief explanation of what this marker indicates",
            "nutritional_relevance": "How this marker relates to nutrition"
        }
    },
    "report_date": "date if found",
    "patient_info": {
        "age": "age if found",
        "sex": "sex if found",
        "anonymized_id": "any ID (anonymized)"
    },
    "summary": {
        "overall_health_status": "Good|Fair|Needs Attention|Critical",
        "nutritional_status": "Well-Nourished|Mild Deficiency|Moderate Deficiency|Severe Deficiency",
        "total_markers": number,
        "normal_count": number,
        "abnormal_count": number,
        "key_concerns": ["list of main health concerns based on abnormal values"],
        "nutrition_focus_areas": ["list of nutritional areas that need attention"]
    },
    "nutritional_profile": {
        "identified_deficiencies": [
            {
                "nutrient": "nutrient name",
                "status": "Deficient|Borderline|Insufficient",
                "based_on_marker": "which blood marker indicates this",
                "importance": "why this nutrient matters",
                "daily_requirement": "recommended daily intake"
            }
        ],
        "nutrients_to_monitor": [
            {
                "nutrient": "nutrient name",
                "reason": "why to monitor",
                "current_status": "adequate|needs_attention|critical"
            }
        ],
        "nutrients_at_good_levels": ["list of nutrients that are at healthy levels"]
    },
    "personalized_macros": {
        "daily_calories": {
            "recommended": "calorie range",
            "rationale": "why this range is recommended based on markers"
        },
        "protein": {
            "grams_per_day": "amount in grams",
            "percentage_of_calories": "percentage",
            "special_notes": "any specific protein recommendations based on markers"
        },
        "carbohydrates": {
            "grams_per_day": "amount in grams",
            "percentage_of_calories": "percentage",
            "preferred_sources": ["list of recommended carb sources"],
            "sources_to_limit": ["carbs to reduce based on markers"]
        },
        "fats": {
            "grams_per_day": "amount in grams",
            "percentage_of_calories": "percentage",
            "omega3_focus": true/false,
            "saturated_fat_limit": "limit in grams",
            "recommended_fat_sources": ["healthy fat sources"]
        },
        "fiber": {
            "grams_per_day": "amount in grams",
            "importance_for_markers": "why fiber matters for the person's markers"
        }
    },
    "abnormal_markers_analysis": [
        {
            "marker_name": "name",
            "current_value": "value with unit",
            "normal_range": "range",
            "status": "High|Low",
            "health_impact": "What this abnormal value means for health",
            "nutritional_cause": "Potential nutritional reasons for this abnormality",
            "key_nutrients_to_address": ["nutrients that can help normalize this marker"],
            "possible_causes": ["cause1", "cause2", "cause3"],
            "risk_if_untreated": "Potential health risks if not addressed"
        }
    ],
    "dietary_recommendations": {
        "eating_philosophy": "Brief personalized eating approach description",
        "foods_to_eat": [
            {
                "food": "food name",
                "benefit": "why this helps",
                "for_marker": "which abnormal marker this helps",
                "nutrients_provided": ["list of key nutrients this food provides"],
                "serving_size": "recommended serving",
                "frequency": "how often to consume"
            }
        ],
        "foods_to_avoid": [
            {
                "food": "food name",
                "reason": "why to avoid",
                "affects_marker": "which marker it affects negatively",
                "alternative": "what to have instead"
            }
        ],
        "superfoods_for_you": [
            {
                "food": "superfood name",
                "why_super_for_you": "personalized reason based on markers",
                "how_to_consume": "best way to eat this food",
                "quantity": "recommended amount"
            }
        ]
    },
    "weekly_meal_plan": {
        "overview": "Brief description of the meal plan approach",
        "calorie_target": "daily calorie target",
        "day_1": {
            "theme": "day theme if any",
            "breakfast": {
                "meal": "meal description",
                "nutrients_focus": ["key nutrients"],
                "calories_approx": "approximate calories"
            },
            "mid_morning_snack": {
                "meal": "snack description",
                "nutrients_focus": ["key nutrients"],
                "calories_approx": "approximate calories"
            },
            "lunch": {
                "meal": "meal description",
                "nutrients_focus": ["key nutrients"],
                "calories_approx": "approximate calories"
            },
            "evening_snack": {
                "meal": "snack description",
                "nutrients_focus": ["key nutrients"],
                "calories_approx": "approximate calories"
            },
            "dinner": {
                "meal": "meal description",
                "nutrients_focus": ["key nutrients"],
                "calories_approx": "approximate calories"
            }
        },
        "day_2": { "same structure as day_1" },
        "day_3": { "same structure as day_1" },
        "day_4": { "same structure as day_1" },
        "day_5": { "same structure as day_1" },
        "day_6": { "same structure as day_1" },
        "day_7": { "same structure as day_1" }
    },
    "recipes": [
        {
            "name": "recipe name",
            "type": "breakfast|lunch|dinner|snack",
            "prep_time": "preparation time",
            "cook_time": "cooking time",
            "servings": number,
            "targets_markers": ["which markers this recipe helps"],
            "ingredients": [
                {
                    "item": "ingredient name",
                    "quantity": "amount",
                    "nutritional_note": "why this ingredient is included"
                }
            ],
            "instructions": ["step 1", "step 2", "step 3"],
            "nutrition_per_serving": {
                "calories": number,
                "protein": "grams",
                "carbs": "grams",
                "fat": "grams",
                "fiber": "grams",
                "key_micronutrients": ["list of important micronutrients"]
            },
            "health_benefits": "how this recipe helps based on markers",
            "tips": "cooking or serving tips"
        }
    ],
    "grocery_list": {
        "proteins": [
            {
                "item": "item name",
                "quantity": "weekly quantity",
                "priority": "essential|recommended|optional",
                "nutritional_benefit": "why to buy this"
            }
        ],
        "vegetables": [
            {
                "item": "item name",
                "quantity": "weekly quantity",
                "priority": "essential|recommended|optional",
                "nutritional_benefit": "why to buy this"
            }
        ],
        "fruits": [
            {
                "item": "item name",
                "quantity": "weekly quantity",
                "priority": "essential|recommended|optional",
                "nutritional_benefit": "why to buy this"
            }
        ],
        "grains_and_legumes": [
            {
                "item": "item name",
                "quantity": "weekly quantity",
                "priority": "essential|recommended|optional",
                "nutritional_benefit": "why to buy this"
            }
        ],
        "dairy_and_alternatives": [
            {
                "item": "item name",
                "quantity": "weekly quantity",
                "priority": "essential|recommended|optional",
                "nutritional_benefit": "why to buy this"
            }
        ],
        "healthy_fats_and_oils": [
            {
                "item": "item name",
                "quantity": "weekly quantity",
                "priority": "essential|recommended|optional",
                "nutritional_benefit": "why to buy this"
            }
        ],
        "herbs_spices_and_condiments": [
            {
                "item": "item name",
                "quantity": "weekly quantity",
                "priority": "essential|recommended|optional",
                "nutritional_benefit": "why to buy this"
            }
        ],
        "beverages": [
            {
                "item": "item name",
                "quantity": "weekly quantity",
                "priority": "essential|recommended|optional",
                "nutritional_benefit": "why to buy this"
            }
        ],
        "foods_to_avoid_buying": ["list of foods not to purchase"],
        "budget_friendly_swaps": [
            {
                "expensive_item": "expensive option",
                "affordable_alternative": "budget-friendly option",
                "nutritional_comparison": "comparison notes"
            }
        ]
    },
    "eating_schedule": {
        "overview": "Personalized eating schedule rationale",
        "recommended_eating_window": "e.g., 7 AM to 7 PM",
        "meals_per_day": number,
        "schedule": [
            {
                "time": "time of day",
                "meal": "meal type",
                "what_to_eat": "food suggestions",
                "why_this_time": "rationale for timing",
                "portion_guidance": "how much to eat"
            }
        ],
        "fasting_recommendation": {
            "recommended": true/false,
            "type": "type of fasting if recommended",
            "reason": "why or why not recommended based on markers"
        },
        "pre_workout_nutrition": {
            "timing": "when to eat before exercise",
            "what_to_eat": ["food suggestions"],
            "why": "rationale"
        },
        "post_workout_nutrition": {
            "timing": "when to eat after exercise",
            "what_to_eat": ["food suggestions"],
            "why": "rationale"
        }
    },
    "hydration_guide": {
        "daily_water_intake": "recommended liters",
        "personalized_reason": "why this amount based on markers",
        "best_times_to_hydrate": ["time1", "time2"],
        "recommended_beverages": [
            {
                "beverage": "beverage name",
                "benefit": "how it helps",
                "amount": "recommended daily amount",
                "when_to_drink": "best time to consume"
            }
        ],
        "beverages_to_avoid": [
            {
                "beverage": "beverage name",
                "reason": "why to avoid",
                "affects_marker": "which marker it impacts"
            }
        ],
        "hydration_tips": ["tip1", "tip2", "tip3"]
    },
    "lifestyle_recommendations": [
        {
            "category": "Exercise|Sleep|Stress|Hydration|Meal_Timing|Food_Preparation|Other",
            "recommendation": "specific recommendation",
            "frequency": "how often",
            "benefit": "expected benefit",
            "impact_on_nutrition": "how this affects nutritional status",
            "priority": "high|medium|low"
        }
    ],
    "supplement_suggestions": [
        {
            "supplement": "name",
            "dosage": "suggested dosage",
            "timing": "when to take",
            "purpose": "why recommended",
            "for_marker": "which marker it helps",
            "food_alternative": "foods that provide this nutrient naturally",
            "caution": "any warnings or interactions",
            "consult_doctor": true/false
        }
    ],
    "food_medicine_interactions": [
        {
            "if_taking": "medication or condition",
            "avoid_foods": ["foods to avoid"],
            "reason": "why these foods interact",
            "safe_alternatives": ["safe food options"]
        }
    ],
    "follow_up_tests": [
        {
            "test_name": "name of test",
            "reason": "why this test is recommended",
            "urgency": "immediate|within_week|within_month|routine",
            "related_marker": "which abnormal marker prompted this",
            "nutrition_connection": "how nutrition relates to this test"
        }
    ],
    "specialist_referrals": [
        {
            "specialist": "type of specialist",
            "reason": "why referral is recommended",
            "urgency": "high|medium|low"
        }
    ],
    "warning_signs": [
        {
            "symptom": "symptom to watch for",
            "action": "what to do if experienced",
            "related_marker": "which marker this relates to",
            "dietary_adjustment": "any immediate dietary changes to make"
        }
    ],
    "progress_tracking": {
        "markers_to_retest": [
            {
                "marker": "marker name",
                "retest_in": "timeframe",
                "target_value": "goal value",
                "dietary_actions": ["what to do to improve this marker"]
            }
        ],
        "expected_improvements": [
            {
                "timeframe": "e.g., 2 weeks, 1 month",
                "expected_changes": ["list of expected improvements"]
            }
        ],
        "signs_diet_is_working": ["sign1", "sign2", "sign3"]
    },
    "positive_findings": ["list of normal/good markers worth mentioning"],
    "general_nutrition_tips": ["tip1", "tip2", "tip3", "tip4", "tip5"],
    "quick_reference_card": {
        "daily_must_haves": ["food1", "food2", "food3"],
        "weekly_goals": ["goal1", "goal2", "goal3"],
        "foods_never_to_eat": ["food1", "food2"],
        "golden_rules": ["rule1", "rule2", "rule3"]
    },
    "disclaimer": "This personalized nutrition plan is for informational purposes only and is based on the provided medical report. Please consult with a registered dietitian or healthcare professional before making significant dietary changes, especially if you have existing health conditions or are taking medications."
}

IMPORTANT INSTRUCTIONS FOR PERSONALIZED NUTRITION:

Analyze ALL markers and their NUTRITIONAL implications
Create SPECIFIC, ACTIONABLE food recommendations with portion sizes
Design a REALISTIC 7-day meal plan that addresses the identified issues
Include RECIPES that are practical and target specific markers
Generate a COMPLETE grocery list organized by category
Consider the person's likely lifestyle based on their markers
Provide TIME-SPECIFIC eating recommendations
Include BUDGET-FRIENDLY alternatives
Focus on WHOLE FOODS before supplements
Make recommendations CULTURALLY inclusive with alternatives
Include PREPARATION TIPS for optimal nutrient retention
Address any potential FOOD-DRUG interactions if medications are mentioned
Set REALISTIC expectations for improvement timelines
Prioritize recommendations by IMPACT and URGENCY

Medical Report Text:
${reportText}

Return ONLY valid JSON, no additional text or markdown.`;

    try {
        console.log('🤖 Calling Gemini API for personalized nutrition analysis...');

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let responseText = response.text();

        console.log('✅ Gemini API response received');

        // Clean up the response - remove markdown code blocks if present
        if (responseText.includes('```json')) {
            responseText = responseText.split('```json')[1].split('```')[0].trim();
        } else if (responseText.includes('```')) {
            responseText = responseText.split('```')[1].split('```')[0].trim();
        }

        const analysis = JSON.parse(responseText);

        // Ensure all required fields exist
        if (!analysis.extracted_markers) analysis.extracted_markers = {};
        if (!analysis.nutritional_profile) {
            analysis.nutritional_profile = {
                identified_deficiencies: [],
                nutrients_to_monitor: [],
                nutrients_at_good_levels: []
            };
        }
        if (!analysis.personalized_macros) {
            analysis.personalized_macros = {
                daily_calories: { recommended: "2000-2200", rationale: "Standard recommendation" },
                protein: { grams_per_day: "50-60g", percentage_of_calories: "20%" },
                carbohydrates: { grams_per_day: "250-300g", percentage_of_calories: "50%" },
                fats: { grams_per_day: "65-75g", percentage_of_calories: "30%" },
                fiber: { grams_per_day: "25-30g" }
            };
        }
        if (!analysis.dietary_recommendations) {
            analysis.dietary_recommendations = {
                foods_to_eat: [],
                foods_to_avoid: [],
                superfoods_for_you: []
            };
        }
        if (!analysis.weekly_meal_plan) {
            analysis.weekly_meal_plan = { overview: "No meal plan generated" };
        }
        if (!analysis.recipes) analysis.recipes = [];
        if (!analysis.grocery_list) {
            analysis.grocery_list = {
                proteins: [],
                vegetables: [],
                fruits: [],
                grains_and_legumes: [],
                dairy_and_alternatives: [],
                healthy_fats_and_oils: [],
                herbs_spices_and_condiments: [],
                beverages: []
            };
        }
        if (!analysis.eating_schedule) {
            analysis.eating_schedule = { schedule: [], overview: "No schedule generated" };
        }
        if (!analysis.hydration_guide) {
            analysis.hydration_guide = { daily_water_intake: "2-3 liters" };
        }
        if (!analysis.lifestyle_recommendations) analysis.lifestyle_recommendations = [];
        if (!analysis.supplement_suggestions) analysis.supplement_suggestions = [];
        if (!analysis.follow_up_tests) analysis.follow_up_tests = [];
        if (!analysis.abnormal_markers_analysis) analysis.abnormal_markers_analysis = [];
        if (!analysis.warning_signs) analysis.warning_signs = [];
        if (!analysis.specialist_referrals) analysis.specialist_referrals = [];
        if (!analysis.progress_tracking) analysis.progress_tracking = {};
        if (!analysis.quick_reference_card) {
            analysis.quick_reference_card = {
                daily_must_haves: [],
                weekly_goals: [],
                foods_never_to_eat: [],
                golden_rules: []
            };
        }

        console.log('✅ Personalized nutrition analysis complete');
        return analysis;
    } catch (error) {
        console.error('❌ Gemini Analysis Error:', error);
        console.error('Error details:', error.message);

        if (error instanceof SyntaxError) {
            console.error('Failed to parse Gemini response as JSON');
            return {
                extracted_markers: {},
                report_date: "Unable to parse",
                patient_info: {},
                error: "Failed to parse AI response",
                nutritional_profile: { identified_deficiencies: [], nutrients_to_monitor: [] },
                dietary_recommendations: { foods_to_eat: [], foods_to_avoid: [] },
                weekly_meal_plan: {},
                recipes: [],
                grocery_list: {},
                lifestyle_recommendations: [],
                supplement_suggestions: [],
                follow_up_tests: []
            };
        }

        throw error;
    }
}

// Routes
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        aiEnabled: true,
        aiProvider: 'Gemini AI (Google)',
        project: 'Personalized Nutrition Recommendation System',
        models: {
            available: ['gemini-2.5-flash', 'gemini-1.5-pro'],
            current: MODEL_NAME
        },
        features: ['OCR', 'PDF Extraction', 'AI Analysis', 'Personalized Nutrition', 'Meal Planning', 'Recipe Generation'],
        timestamp: new Date().toISOString()
    });
});

// List available models endpoint
app.get('/api/list-models', async (req, res) => {
    try {
        const models = [
            'gemini-2.5-flash',
            'gemini-1.5-pro',
            'gemini-1.5-flash',
            'gemini-pro'
        ];

        res.json({
            success: true,
            currentModel: MODEL_NAME,
            suggestedModels: models,
            message: 'Try these model names if you encounter errors'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Upload and extract text
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileType = req.file.mimetype;
        let extractedText = '';

        console.log(`📄 Processing file: ${req.file.originalname} (${fileType})`);

        if (fileType.startsWith('image/')) {
            console.log('🔍 Performing OCR on image...');
            extractedText = await performOCR(req.file.buffer);
        } else if (fileType === 'application/pdf') {
            console.log('📑 Extracting text from PDF...');
            extractedText = await extractTextFromPDF(req.file.buffer);
        }

        console.log(`✅ Text extracted: ${extractedText.length} characters`);

        res.json({
            success: true,
            text: extractedText,
            fileName: req.file.originalname,
            fileType: fileType,
            characterCount: extractedText.length
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Analyze report with AI
app.post('/api/analyze', async (req, res) => {
    try {
        console.log('📥 Received analysis request');

        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'No text provided' });
        }

        console.log(`📝 Text length: ${text.length} characters`);
        console.log('🤖 Starting personalized nutrition analysis...');

        const analysis = await analyzeWithGemini(text);

        console.log('✅ Analysis complete, sending response');

        res.json({
            success: true,
            analysis: analysis,
            model: MODEL_NAME
        });
    } catch (error) {
        console.error('❌ Analysis Error:', error);
        console.error('Error stack:', error.stack);

        let errorMessage = 'Failed to analyze report';
        let statusCode = 500;

        if (error.message?.includes('API key') || error.message?.includes('API_KEY_INVALID')) {
            errorMessage = 'Invalid API key';
            statusCode = 401;
        } else if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
            errorMessage = 'Rate limit or quota exceeded';
            statusCode = 429;
        } else if (error.message?.includes('SAFETY')) {
            errorMessage = 'Content blocked by safety filters';
            statusCode = 400;
        } else if (error.message?.includes('not found') || error.message?.includes('404')) {
            errorMessage = 'Model not available. Try changing MODEL_NAME in server.js';
            statusCode = 404;
        }

        res.status(statusCode).json({
            success: false,
            error: errorMessage,
            details: error.message,
            suggestion: 'Try changing MODEL_NAME to a different model'
        });
    }
});

// Test AI
app.get('/api/test-ai', async (req, res) => {
    try {
        console.log('🧪 Testing Gemini AI connection...');
        console.log(`📋 Using model: ${MODEL_NAME}`);

        const result = await model.generateContent("Say 'AI is working' in JSON format with a status field");
        const response = await result.response;
        const responseText = response.text();

        console.log('✅ AI test successful');

        res.json({
            success: true,
            message: 'Gemini AI is connected and working',
            model: MODEL_NAME,
            response: responseText
        });
    } catch (error) {
        console.error('❌ AI Test Error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            model: MODEL_NAME,
            suggestion: 'Try these models: gemini-2.5-flash, gemini-1.5-pro'
        });
    }
});

// Error handling
app.use((error, req, res, next) => {
    console.error('Server Error:', error);
    res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🥗 Personalized Nutrition Recommendation System`);
    console.log(`🤖 AI Provider: Gemini (Google)`);
    console.log(`📊 Model: ${MODEL_NAME}`);
    console.log(`🔑 API Key: ${API_KEY.substring(0, 15)}...`);
    console.log('='.repeat(60));
    console.log('');
    console.log('Available endpoints:');
    console.log(`  GET  http://localhost:${PORT}/api/health`);
    console.log(`  GET  http://localhost:${PORT}/api/test-ai`);
    console.log(`  GET  http://localhost:${PORT}/api/list-models`);
    console.log(`  POST http://localhost:${PORT}/api/upload`);
    console.log(`  POST http://localhost:${PORT}/api/analyze`);
    console.log('');
});