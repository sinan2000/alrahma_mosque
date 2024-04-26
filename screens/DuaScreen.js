import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import SegmentedControlTabs from 'react-native-segmented-control-tabs';

const duaData = [
    {
        arabic: "اللَّهُمَّ أَذْهِبْ غَيْظَ قَلْبِي",
        english: "Oh Allah, remove anger from my heart.",
        pronunciation: "Allahumma azhib Gaydha Qalbee.",
    },
    {
        arabic: "اللهم إن كان هذا الأمر خيرا لي فَاقْدُرْهُ لِي وَيَسِّرْهُ لِي ثُمَّ بَارِكْ لِي فِيهِ",
        english: "Oh Allah, if my intended action is best for me, make it destined and easy for me, and grant me Your Blessings in it.",
        pronunciation: "Allahumma in kaana haatha alAmr khayran lee fa iQ-dirhu lee wa yassirhu lee summa baarik lee feehi.",
    },
    {
        arabic: "اللهم طهر قلبي من كل سوء ، اللهم طهر قلبي من كل ما يبغضك، اللهم طهر قلبي من كل غلٍ وحقدٍ وحسد وكبر",
        english: "Oh Allah, clean away all forms of evil from my heart. Oh Allah, clean my heart and remove everything that displeases you. Oh Allah, clean my heart of every form of bitterness, hard feelings, and jealousy.",
        pronunciation: "Allahumma Tahhir Qalbee min kulli suu, Allahumma Tahhir Qalbee min kulli maa yubaGGiDuk. Allahumma Tahhir Qalbee min kulli Gillin wa HiQdin wa Hasadin wa kibr.",
    },
    {
        arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ الْهَمِّ وَالْحُزْنِ وَالْعَجْزِ وَالْكَسَلِ وَالْبُخْلِ وَالْجُبْنِ وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ",
        english: "O Allah, I take refuge in you from anxiety and sorrow, weakness and laziness, miserliness and cowardice, the burden of debts and from being overpowered by men.",
        pronunciation: "Allahumma innee a3uzubika min alham wa alhuzn wa al3ajz wa alkusl wa albukhl wa aljubn wa galbah aldayn wa Galbah alrijaal.",
    },
    {
        arabic: "اللهمّ فارج الهم، كاشف الغم، مذهب الحزن، اكشف اللهمّ عنّي همّي وغمّي ، وأذهب عنّي حزني",
        english: "Oh Allah, Reliever of anxiety, Remover of distress, Dispeller of grief! Remove my anxiety, distress, and dispel from me my sadness.",
        pronunciation: "Allahumma Faarij alhamm, kaashif alGamm, muzhib alhuzn, ikshif Allahumma 3annee hammee wa Gammee, wa azhib 3annee huznee.",
    },
    {
        arabic: "اللهمّ اجعل في قلبي نوراً، وفي لساني نوراً، واجعل في سمعي نوراً، واجعل في بصري نوراً، واجعل من خلفي نوراً، ومن أمامي نوراً، واجعل من فوقي نوراً، ومن تحتي نوراً، اللهمّ أعطني نوراً",
        english: "Oh Allah! Place in my heart, light. Place in my tongue, light. Place in my hearing, light. Place in my sight, light. Place behind me, light. Place before me, light. Place above me, light. Place under me, light. Oh Allah grant me light!",
        pronunciation: "Allahumma Ij3al fee qalbee noora, wa fee lisaanee noora, wa ij3al fee sam3ee noora, wa ij3al fee baSaree noora, wa ij3al min khalfee noora, wa min amaamee noora, wa ij3al min fawqee nooraa, wa mmin tahtee noora, Allahumma a3Tinee noora.",
    },
    {
        arabic: "اللهم إني أعوذ بك من شر سمعي، ومن شر بصري، ومن شر لساني، ومن شر قلبي، ومن شر منيي",
        english: "Oh Allah, I seek protection in you from the evil of my hearing, from the evil of my sight, from the evil of my tongue, from the evil of my heart, and from the evil of myself.",
        pronunciation: "Allahumma innee a3uzubika min sharri sam3ee, wa min sharri baSaree, wa min sharri lisaanee, wa min sharri qalbee, wa min sharri minnee.",
    },
    {
        arabic: "اللهم اخرجني من الظلمات إلى النور",
        english: "Oh Allah take me out of darkness and into the light.",
        pronunciation: "Allahumma Akhrijnee min aldulumaat ilaa alnur.",
    },
    {
        arabic: "اللهم إليك أشكو ضعف قوتي وقلة حيلتي وهواني على الناس يا أرحم الراحمين أنت ربُّ المستضعفين وانت ربّي",
        english: "To You, my Lord, I complain of my weakness, lack of support and the humiliation I am made to receive. Most Compassionate and Merciful! You are the Lord of the weak, and you are my Lord.",
        pronunciation: "Allahuma ilayka ashku da'fa quwwati wa qillata heelatee wa hawanee 3ala an-naas ya arhamur rahimeen annta Rabbul mustad'afeen wa anta rabbi.",
    },
    {
        arabic: "اللهم امنحني القوة لأقاوم نفسي، والشجاعة لأواجه ضعفي، واليقين لأتقبل قدري، والرضا ليرتاح عقلي، والفهم ليطمئن قلبي",
        english: "Oh Allah! Grant me the strength to oppose myself, the courage to face my weakness, the conviction to accept my faith, the satisfaction of to relax my mind, and the understanding to reassure my heart.",
        pronunciation: "Allahumma imnaHnee alQuwwah li aQwaami nafseee, wa ash-Shujaa3ah li uwaajih da3fee, wa alYaqeeni li ataQabbal qadree, wa ar-riDaa li yartaah 3aQalee, wa alfahm li yaTmainna Qalbee.",
    }
];

const dhikrData = [
    {
        arabic: "سُبْحَانَ اللّهِ",
        english: "Glory be to Allah.",
        pronunciation: "Subhanallah",
        title: "Tasbih",
    },
    {
        arabic: "الْحَمْدُ لِلّهِ",
        english: "All praise is due to Allah.",
        pronunciation: "Alhamdulillah",
        title: "Tahmid",
    },
    {
        arabic: "اللّهُ أَكْبَرُ",
        english: "Allah is the Greatest.",
        pronunciation: "Allahu Akbar",
        title: "Takbir",
    },
    {
        arabic: "لا إِلٰهَ إِلَّا اللهُ",
        english: "There is no deity but Allah.",
        pronunciation: "La ilaha illallah",
        title: "Tahlil",
    },
    {
        arabic: "أَسْتَغْفِرُ اللهَ",
        english: "I seek forgiveness from Allah.",
        pronunciation: "Astaghfirullah",
        title: "Istighfar",
    }
];

const Item = ( {arabic, english, pronunciation, title, isDhikr, onIncrement, onReset, count } ) => {
    return (
        <View style={styles.itemContainer}>
            {isDhikr && 
                <Text style={styles.boldTitle}>{title}</Text>
            }
            <Text style={styles.arabicText}>{arabic}</Text>
            <Text style={styles.englishText}>{english}</Text>
            <Text style={styles.pronunciationText}>{pronunciation}</Text>
            {isDhikr && (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.resetButton} onPress={onReset}>
                        <Text style={styles.buttonText}>Reset</Text>
                    </TouchableOpacity>
                <View style={{ flexDirection: 'column', alignItems: 'flex-end', flex: 1 }}>
                    <Text style={styles.addButtonLabel}>Click to add</Text>
                    <TouchableOpacity style={styles.counterButton} onPress={onIncrement}>
                        <Text style={styles.buttonText}>{count}</Text>
                    </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};

export default function DuaScreen() {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const renderItems = selectedIndex === 0 ? duaData : dhikrData;
    const [counters, setCounters] = useState(new Array(dhikrData.length).fill(0));

    const handleIndexChange = index => {
        setSelectedIndex(index);
    }

    const incrementCounter = (index) => {
        const newCounters = [...counters];
        newCounters[index]++;
        setCounters(newCounters);
    }

    const resetCounter = (index) => {
        const newCounters = [...counters];
        newCounters[index] = 0;
        setCounters(newCounters);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={{ marginTop: 20, alignItems:'center'}}>
            <SegmentedControlTabs
                values={[
                    <Text>Duas</Text>, 
                    <Text>Dhikr</Text>
                ]}
                handleOnChangeIndex={handleIndexChange}
                activeIndex={selectedIndex}
                tabsContainerStyle={{
                    width: '80%',
                    height: 35,
                    backgroundColor: '#EAF3FF',
                    borderTopLeftRadius: 20,
                    borderBottomLeftRadius: 20,
                    borderTopRightRadius: 20,
                    borderBottomRightRadius: 20,
                    borderColor: '#EAF3FF',
                    borderWidth: 1,
                }}
                activeTabStyle={{
                    borderBottomColor: "#0e9d87",
                    borderBottomWidth: 3,
                    borderColor: "rgb(213,228,241)",
                    zIndex: 1,
                }}
                firstTabStyle={{
                    borderTopLeftRadius: 20,
                    borderBottomLeftRadius: 20,
                    backgroundColor: '#fff'
                }}
                lastTabStyle={{
                    borderTopRightRadius: 20,
                    borderBottomRightRadius: 20,
                    backgroundColor: '#fff'
                }}
                tabStyle={{
                    borderColor: 'transparent'
                }}
            />
            </View>
            {renderItems.map((item, index) => (
                <Item 
                    key={index}
                    arabic={item.arabic}
                    english={item.english}
                    pronunciation={item.pronunciation}
                    title={selectedIndex === 1 ? item.title : ''}
                    isDhikr={selectedIndex === 1}
                    onIncrement={() => incrementCounter(index)}
                    onReset={() => resetCounter(index)}
                    count={counters[index]}
                />
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f1f6',
    },
    itemContainer: {
      backgroundColor: 'white',
      padding: 16,
      //marginBottom: 10,
      marginHorizontal: 16,
      borderRadius: 8,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
      marginTop: 15,
    },
    arabicText: {
      fontSize: 20,
      textAlign: 'right',
      //fontFamily: 'Traditional Arabic',
      marginBottom: 8,
    },
    englishText: {
      fontSize: 16,
      marginBottom: 6,
    },
    pronunciationText: {
      fontSize: 14,
      color: 'gray',
    },
    buttonContainer: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    counterButton: {
        backgroundColor: '#0e9d87',
        //padding: 10,
        borderRadius: 20,
        height: 40,
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    resetButton: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    boldTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 10,
    },
    addButtonLabel: {
        color: 'gray',
        fontSize: 14,
        marginBottom: 5,
    }
  });