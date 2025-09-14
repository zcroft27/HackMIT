package bottle

import (
	"fmt"
	"hackmit/internal/errs"
	"hackmit/internal/models"
	"regexp"
	"strings"

	"github.com/gofiber/fiber/v2"
)

// SeverityLevel represents the severity of detected content
type SeverityLevel int

const (
	SeverityLow SeverityLevel = iota
	SeverityMedium
	SeverityHigh
	SeverityCritical
)

func (s SeverityLevel) String() string {
	switch s {
	case SeverityLow:
		return "low"
	case SeverityMedium:
		return "medium"
	case SeverityHigh:
		return "high"
	case SeverityCritical:
		return "critical"
	default:
		return "unknown"
	}
}

// Category represents different types of harmful content
type Category int

const (
	CategoryHate Category = iota
	CategoryThreat
	CategoryHarassment
	CategoryDiscrimination
	CategorySlur
	CategoryProfanity
)

func (c Category) String() string {
	switch c {
	case CategoryHate:
		return "hate_speech"
	case CategoryThreat:
		return "threat"
	case CategoryHarassment:
		return "harassment"
	case CategoryDiscrimination:
		return "discrimination"
	case CategorySlur:
		return "slur"
	case CategoryProfanity:
		return "profanity"
	default:
		return "unknown"
	}
}

// Pattern represents a detection pattern
type Pattern struct {
	Regex       *regexp.Regexp
	Category    Category
	Severity    SeverityLevel
	Description string
	Confidence  float64
}

// HateSpeechChecker is the main checker struct
type HateSpeechChecker struct {
	patterns              []Pattern
	threshold             float64
	caseSensitive         bool
	enableProfanityFilter bool
}

// NewHateSpeechChecker creates a new checker instance
func NewHateSpeechChecker() *HateSpeechChecker {
	checker := &HateSpeechChecker{
		threshold:             0.3,
		caseSensitive:         false,
		enableProfanityFilter: true,
	}
	checker.initializePatterns()
	return checker
}

// initializePatterns sets up the detection patterns
func (hsc *HateSpeechChecker) initializePatterns() {
	patterns := []struct {
		pattern     string
		category    Category
		severity    SeverityLevel
		description string
		confidence  float64
	}{
		// Direct hate speech and threats
		{`\b(hate|despise|detest|loathe)\s+(all|those|these|every)\s+\w+`, CategoryHate, SeverityHigh, "General hate expression", 0.85},
		{`\b(kill|murder|eliminate|execute|exterminate)\s+(all|those|these|every)\s+\w+`, CategoryThreat, SeverityCritical, "Violent threat against groups", 0.95},
		{`\byou\s+(should|deserve to|need to|ought to)\s+(die|disappear|leave|burn|suffer)`, CategoryThreat, SeverityHigh, "Personal threat", 0.90},
		{`\b(kill|hurt|harm|beat|attack)\s+(yourself|urself)`, CategoryThreat, SeverityCritical, "Self-harm encouragement", 0.95},
		{`\bcommit\s+suicide\b`, CategoryThreat, SeverityCritical, "Suicide encouragement", 0.90},
		{`\bend\s+your\s+life\b`, CategoryThreat, SeverityCritical, "Suicide encouragement", 0.85},

		// Discrimination and dehumanization
		{`\b(inferior|subhuman|worthless|animals|vermin|parasites)\s+(race|people|group|beings)`, CategoryDiscrimination, SeverityHigh, "Dehumanizing language", 0.85},
		{`\b(go back to|don't belong|not welcome|not wanted|get out)`, CategoryDiscrimination, SeverityMedium, "Exclusionary language", 0.65},
		{`\b(pure|master|superior)\s+(race|blood|breeding|genes)`, CategoryDiscrimination, SeverityCritical, "Supremacist language", 0.90},
		{`\b(ethnic|racial)\s+(cleansing|purification|removal)`, CategoryDiscrimination, SeverityCritical, "Genocide language", 0.95},
		{`\bfinal\s+solution\b`, CategoryDiscrimination, SeverityCritical, "Nazi reference", 0.95},

		// Slurs and offensive terms (using patterns to avoid explicit terms)
		{`\b\w*[nN][1!i][gG9]{2}[aAeE3@][hHrR]*\w*\b`, CategorySlur, SeverityCritical, "Racial slur", 0.95},
		{`\b[fF][aA4@][gG9]{1,2}[oO0@][tT7]?[sS5$]?\b`, CategorySlur, SeverityHigh, "Homophobic slur", 0.90},
		{`\b[rR][eE3][tT7][aA4@][rR][dD]([eE3][dD]|[sS5$])?\b`, CategorySlur, SeverityHigh, "Ableist slur", 0.85},
		{`\b\w*[tT7][aA4@][rR][dD]\b`, CategorySlur, SeverityMedium, "Ableist suffix", 0.70},
		{`\b[tT7]r[aA4@]nn(y|ie|ies)\b`, CategorySlur, SeverityHigh, "Transphobic slur", 0.85},
		{`\b[kK][iI1!][kK3][eE3]\b`, CategorySlur, SeverityCritical, "Ethnic slur", 0.90},
		{`\b[sS5$][pP][iI1!][cC][kK3]?\b`, CategorySlur, SeverityMedium, "Ethnic slur", 0.75},

		// Harassment and personal attacks
		{`\b(ugly|stupid|worthless|pathetic|disgusting|repulsive)\s+(piece of|excuse for|waste of)`, CategoryHarassment, SeverityMedium, "Personal attack", 0.75},
		{`\byou\s+(suck|blow|are\s+(garbage|trash|shit|crap))`, CategoryHarassment, SeverityMedium, "Personal insult", 0.70},
		{`\b(shut up|stfu|fuck off|piss off|go away)\s+(bitch|whore|slut|cunt)`, CategoryHarassment, SeverityHigh, "Gendered harassment", 0.85},
		{`\b(dumb|stupid|retarded)\s+(bitch|whore|slut|cunt|hoe)`, CategoryHarassment, SeverityHigh, "Misogynistic abuse", 0.85},
		{`\byour\s+(mom|mother|family)\s+(is|are)\s+(dead|gonna die|should die)`, CategoryThreat, SeverityHigh, "Family threat", 0.80},

		// Sexual harassment
		{`\b(send|show|post)\s+(nudes|nude pics|naked pics)`, CategoryHarassment, SeverityMedium, "Sexual harassment", 0.75},
		{`\bi\s+(want to|gonna|will)\s+(rape|molest|assault)\s+you`, CategoryThreat, SeverityCritical, "Sexual threat", 0.95},
		{`\bsuck\s+my\s+(dick|cock|penis)`, CategoryHarassment, SeverityMedium, "Sexual harassment", 0.70},

		// Violence and threats
		{`\bi\s+(will|gonna|am going to)\s+(kill|murder|hurt|beat|stab|shoot)\s+you`, CategoryThreat, SeverityCritical, "Direct threat", 0.95},
		{`\bi\s+know\s+where\s+you\s+live`, CategoryThreat, SeverityHigh, "Stalking threat", 0.85},
		{`\bwatch\s+your\s+back\b`, CategoryThreat, SeverityMedium, "Implicit threat", 0.65},
		{`\byou(r|re)\s+(gonna|going to)\s+(get|be)\s+(hurt|killed|beaten|shot|stabbed)`, CategoryThreat, SeverityHigh, "Threat prediction", 0.80},

		// Extremist and terrorist content
		{`\b(bomb|explosive|jihad|terrorist|attack)\s+(plan|making|building|preparation)`, CategoryThreat, SeverityCritical, "Terrorist content", 0.95},
		{`\b(white|aryan)\s+(power|pride|nation|brotherhood)`, CategoryHate, SeverityCritical, "White supremacy", 0.90},
		{`\b(heil|sieg)\s+(hitler|heil)\b`, CategoryHate, SeverityCritical, "Nazi salute", 0.95},
		{`\b14\s*\/?\s*88\b`, CategoryHate, SeverityCritical, "Nazi code", 0.90},

		// Profanity (various levels)
		{`\bf+u+c+k+(ing?|ed|er|s)?\b`, CategoryProfanity, SeverityLow, "Strong profanity", 0.60},
		{`\bs+h+i+t+(s|ty|tier)?\b`, CategoryProfanity, SeverityLow, "Mild profanity", 0.50},
		{`\bb+i+t+c+h+(es|y)?\b`, CategoryProfanity, SeverityLow, "Gendered profanity", 0.65},
		{`\ba+s+s+(hole|hat)?\b`, CategoryProfanity, SeverityLow, "Mild profanity", 0.55},
		{`\bd+a+m+n+(ed|it)?\b`, CategoryProfanity, SeverityLow, "Mild profanity", 0.40},
		{`\bc+u+n+t+s?\b`, CategorySlur, SeverityMedium, "Gendered slur", 0.80},
		{`\bw+h+o+r+e+s?\b`, CategorySlur, SeverityMedium, "Gendered slur", 0.75},
		{`\bs+l+u+t+s?\b`, CategorySlur, SeverityMedium, "Gendered slur", 0.75},

		// Leetspeak and substitution patterns
		{`\bf[u@!*#$%^&*()_+\-=\[\]{}|;':"\\|,.<>?]*[ck@*#$%^&*()_+\-=\[\]{}|;':"\\|,.<>?]k`, CategoryProfanity, SeverityLow, "Obfuscated profanity", 0.70},
		{`\bs[h@*#$%^&*()_+\-=\[\]{}|;':"\\|,.<>?!]*[i1!@*#$%^&*()_+\-=\[\]{}|;':"\\|,.<>?]*t`, CategoryProfanity, SeverityLow, "Obfuscated profanity", 0.65},

		// Extremist organizations and symbols
		{`\b(kkk|ku klux klan|white knights)\b`, CategoryHate, SeverityCritical, "Hate group reference", 0.95},
		{`\b(nazi|fascist|hitler)\s+(party|ideology|beliefs)`, CategoryHate, SeverityCritical, "Nazi ideology", 0.90},
		{`\b(isis|isil|al.?qaeda|taliban)\s+(supporter|member|fighter)`, CategoryHate, SeverityCritical, "Terrorist affiliation", 0.95},

		// Discriminatory language by group
		{`\ball\s+(jews|muslims|christians|blacks|whites|asians|latinos|hispanics)\s+are\s+(bad|evil|terrorists|criminals)`, CategoryDiscrimination, SeverityHigh, "Group generalization", 0.85},
		{`\b(jews|muslims|christians|gays|trans|women|men)\s+(control|run|own)\s+the\s+world`, CategoryDiscrimination, SeverityMedium, "Conspiracy theory", 0.70},

		// Body shaming and appearance-based harassment
		{`\byou\s+are\s+(so|really|extremely)?\s*(fat|ugly|gross|disgusting|hideous)`, CategoryHarassment, SeverityMedium, "Body shaming", 0.75},
		{`\b(fat|ugly|gross)\s+(pig|cow|whale|monster)`, CategoryHarassment, SeverityHigh, "Dehumanizing body shaming", 0.80},

		// Mental health stigma
		{`\byou\s+are\s+(crazy|insane|mental|psycho|nuts)`, CategoryHarassment, SeverityMedium, "Mental health stigma", 0.70},
		{`\bget\s+(help|therapy|medication)\s+you\s+(psycho|nutjob|lunatic)`, CategoryHarassment, SeverityMedium, "Mental health abuse", 0.75},
	}

	hsc.patterns = make([]Pattern, 0, len(patterns))

	for _, p := range patterns {
		// flags := regexp.IgnoreCase
		// if hsc.caseSensitive {
		// 	flags = 0
		// }

		regex, err := regexp.Compile("(?i)" + p.pattern)
		if err != nil {
			continue // Skip invalid patterns
		}

		hsc.patterns = append(hsc.patterns, Pattern{
			Regex:       regex,
			Category:    p.category,
			Severity:    p.severity,
			Description: p.description,
			Confidence:  p.confidence,
		})
	}
}

// IsHateful returns a simple yes/no answer for hate speech detection
func (hsc *HateSpeechChecker) IsHateful(text string) bool {
	// Preprocess text
	processedText := text
	if !hsc.caseSensitive {
		processedText = strings.ToLower(text)
	}

	// Check patterns - return true immediately on first significant match
	for _, pattern := range hsc.patterns {
		if pattern.Confidence >= hsc.threshold {
			if pattern.Regex.MatchString(processedText) {
				return true
			}
		}
	}

	return false
}

// SetThreshold sets the detection threshold (0.0 to 1.0)
func (hsc *HateSpeechChecker) SetThreshold(threshold float64) {
	if threshold >= 0.0 && threshold <= 1.0 {
		hsc.threshold = threshold
	}
}

// Initialize hate speech checker as a package variable for reuse
var hateSpeechChecker = NewHateSpeechChecker()

// moderateContent checks if the content contains hate speech
func moderateContent(content string) bool {
	return hateSpeechChecker.IsHateful(content)
}

// extractTextContent extracts all text fields from the request for moderation
func extractTextContent(filterParams models.CreateBottleRequest) []string {
	var textFields []string

	// Add all text fields that should be moderated
	// Adjust these based on your actual CreateBottleRequest struct fields
	if filterParams.Content != "" {
		textFields = append(textFields, filterParams.Content)
	}
	if filterParams.Author != nil {
		textFields = append(textFields, *filterParams.Author)
	}
	if filterParams.LocationFrom != nil {
		textFields = append(textFields, *filterParams.LocationFrom)
	}
	// Add other text fields as needed based on your model

	return textFields
}

func (h *Handler) CreateBottle(c *fiber.Ctx) error {
	var filterParams models.CreateBottleRequest
	if err := c.BodyParser(&filterParams); err != nil {
		return errs.BadRequest(fmt.Sprintf("error parsing request body: %v", err))
	}

	// Content moderation - check for hate speech
	textFields := extractTextContent(filterParams)
	for _, text := range textFields {
		if text != "" && moderateContent(text) {
			return errs.BadRequest("Content blocked: Message contains inappropriate content that violates our community guidelines")
		}
	}

	// Original bottle creation logic
	if filterParams.Personal != nil && *filterParams.Personal {
		personalTag, tag_err := h.tagRepository.GetPersonalTag(c.Context())
		if tag_err != nil {
			return tag_err
		}
		filterParams.TagID = &personalTag.ID
	} else if filterParams.TagID == nil {
		defaultTag, tag_err := h.tagRepository.GetDefaultTag(c.Context())
		if tag_err != nil {
			return tag_err
		}
		filterParams.TagID = &defaultTag.ID
	}

	bottle, err := h.bottleRepository.CreateBottle(c.Context(), filterParams)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(bottle)
}
