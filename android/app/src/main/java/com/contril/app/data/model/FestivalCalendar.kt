package com.contril.app.data.model

import java.time.LocalDate
import java.time.Month

data class FestivalGreeting(
    val festivalId: String,
    val name: String,
    val greetingTemplate: String, // e.g. "শুভ দুর্গা পূজা, %s!"
    val subtitle: String,
    val accentColorHex: Long = 0xFFD97706, // Amber/Gold accent
    val iconEmoji: String = "✨"
)

object FestivalCalendar {

    data class FestivalDate(
        val month: Month,
        val day: Int,
        val greeting: FestivalGreeting
    )

    // Curated Reference Dataset of Major Festivals (Current calendar dates & annual observances)
    private val fixedFestivals = listOf(
        FestivalDate(
            Month.JANUARY, 1,
            FestivalGreeting(
                festivalId = "new_year",
                name = "New Year's Day",
                greetingTemplate = "Happy New Year, %s!",
                subtitle = "Wishing you a brilliant, inspiring, and productive year ahead.",
                iconEmoji = "🎉"
            )
        ),
        FestivalDate(
            Month.JANUARY, 14,
            FestivalGreeting(
                festivalId = "makar_sankranti",
                name = "Makar Sankranti & Pongal",
                greetingTemplate = "Happy Makar Sankranti, %s!",
                subtitle = "May the harvest season bring abundance, warmth, and joy.",
                iconEmoji = "🪁"
            )
        ),
        FestivalDate(
            Month.JANUARY, 26,
            FestivalGreeting(
                festivalId = "republic_day",
                name = "Republic Day",
                greetingTemplate = "Happy Republic Day, %s!",
                subtitle = "Honoring our unity, constitution, and democratic heritage.",
                iconEmoji = "🇮🇳"
            )
        ),
        FestivalDate(
            Month.APRIL, 14,
            FestivalGreeting(
                festivalId = "poila_boishakh",
                name = "Poila Boishakh",
                greetingTemplate = "শুভ নববর্ষ, %s!",
                subtitle = "Wishing you peace, happiness, and prosperity in the Bengali New Year.",
                iconEmoji = "🌸"
            )
        ),
        FestivalDate(
            Month.APRIL, 15,
            FestivalGreeting(
                festivalId = "poila_boishakh_2",
                name = "Poila Boishakh",
                greetingTemplate = "শুভ নববর্ষ, %s!",
                subtitle = "Wishing you peace, happiness, and prosperity in the Bengali New Year.",
                iconEmoji = "🌸"
            )
        ),
        FestivalDate(
            Month.AUGUST, 15,
            FestivalGreeting(
                festivalId = "independence_day",
                name = "Independence Day",
                greetingTemplate = "Happy Independence Day, %s!",
                subtitle = "Celebrating independence, freedom, and Indian innovation.",
                iconEmoji = "🇮🇳"
            )
        ),
        FestivalDate(
            Month.AUGUST, 19,
            FestivalGreeting(
                festivalId = "raksha_bandhan",
                name = "Raksha Bandhan",
                greetingTemplate = "Happy Raksha Bandhan, %s!",
                subtitle = "Celebrating cherished bonds of protection, love, and togetherness.",
                iconEmoji = "🪢"
            )
        ),
        FestivalDate(
            Month.DECEMBER, 25,
            FestivalGreeting(
                festivalId = "christmas",
                name = "Christmas",
                greetingTemplate = "Merry Christmas, %s!",
                subtitle = "Wishing you warmth, peace, and joyous holiday celebrations.",
                iconEmoji = "🎄"
            )
        )
    )

    // Dynamic / Lunisolar Festival Dates Map (Year -> (Month, Day) -> Greeting)
    data class YearFestival(
        val year: Int,
        val month: Month,
        val day: Int,
        val greeting: FestivalGreeting
    )

    private val dynamicFestivals = listOf(
        // 2026 Observances
        YearFestival(
            2026, Month.MARCH, 4,
            FestivalGreeting("holi", "Holi & Dol Jatra", "শুভ দোলযাত্রা ও Happy Holi, %s!", "May your day be filled with vibrant joy, laughter, and colors.", iconEmoji = "🎨")
        ),
        YearFestival(
            2026, Month.MARCH, 20,
            FestivalGreeting("eid_ul_fitr", "Eid ul-Fitr", "Eid Mubarak, %s!", "Wishing you and your family peace, harmony, and blessings.", iconEmoji = "🌙")
        ),
        YearFestival(
            2026, Month.MAY, 27,
            FestivalGreeting("eid_al_adha", "Eid al-Adha", "Eid Mubarak, %s!", "Wishing you peace, happiness, and prosperity on Eid.", iconEmoji = "🌙")
        ),
        YearFestival(
            2026, Month.SEPTEMBER, 14,
            FestivalGreeting("ganesh_chaturthi", "Ganesh Chaturthi", "Happy Ganesh Chaturthi, %s!", "May Lord Ganesha remove obstacles and bring success to your endeavors.", iconEmoji = "🐘")
        ),
        // Durga Puja 2026 (Oct 18-22)
        YearFestival(
            2026, Month.OCTOBER, 18,
            FestivalGreeting("durga_puja_sasthi", "Maha Sasthi", "শুভ দুর্গাপূজা, %s!", "May Maa Durga bless your home with joy and prosperity.", iconEmoji = "🪔")
        ),
        YearFestival(
            2026, Month.OCTOBER, 19,
            FestivalGreeting("durga_puja_saptami", "Maha Saptami", "শুভ দুর্গাপূজা, %s!", "Warmest greetings of Maha Saptami to you and your loved ones.", iconEmoji = "🪔")
        ),
        YearFestival(
            2026, Month.OCTOBER, 20,
            FestivalGreeting("durga_puja_ashtami", "Maha Ashtami", "শুভ মহা অষ্টমী, %s!", "Wishing you divine blessings and joy on this auspicious Maha Ashtami.", iconEmoji = "🪔")
        ),
        YearFestival(
            2026, Month.OCTOBER, 21,
            FestivalGreeting("durga_puja_navami", "Maha Navami", "শুভ মহা নবমী, %s!", "May this festive season bring boundless joy and success.", iconEmoji = "🪔")
        ),
        YearFestival(
            2026, Month.OCTOBER, 22,
            FestivalGreeting("vijaya_dashami", "Shubho Bijoya", "শুভ বিজয়া দশমী, %s!", "শুভ বিজয়ার প্রীতি ও আন্তরিক শুভেচ্ছা। Wishing you peace and victory.", iconEmoji = "🪔")
        ),
        YearFestival(
            2026, Month.NOVEMBER, 8,
            FestivalGreeting("diwali", "Diwali & Kali Puja", "শুভ দীপাবলি ও শ্যামাপূজা, %s!", "May the festival of lights illuminate your life with health and prosperity.", iconEmoji = "🪔")
        )
    )

    /**
     * Checks if today's date matches a recognized festival
     */
    fun getTodaysFestivalGreeting(date: LocalDate = LocalDate.now()): FestivalGreeting? {
        val year = date.year
        val month = date.month
        val day = date.dayOfMonth

        // 1. Check dynamic lunisolar festivals for this year
        val dynamicMatch = dynamicFestivals.find { it.year == year && it.month == month && it.day == day }
        if (dynamicMatch != null) {
            return dynamicMatch.greeting
        }

        // 2. Check fixed festivals
        val fixedMatch = fixedFestivals.find { it.month == month && it.day == day }
        return fixedMatch?.greeting
    }
}
