import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Dimensions } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import SegmentedControlTabs from 'react-native-segmented-control-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { i18n } from '../i18n';

const window = Dimensions.get('window');
const height_scale = window.height / 100;
const width_scale = window.width / 100;

const Item = ( {arabic, english, pronunciation, title, isDhikr, onIncrement, onReset, count } ) => {
    return (
        <View style={styles.itemContainer}>
            {isDhikr && <Text style={styles.boldTitle}>{title}</Text>}
            <Text style={styles.arabicText}>{arabic}</Text>
            <Text style={styles.englishText}>{english}</Text>
            <Text style={styles.pronunciationText}>{pronunciation}</Text>
            {isDhikr && (
                <View style={styles.counterContainer}>
                    <Text style={styles.addButtonLabel}>Click to add</Text>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.resetButton} onPress={onReset}>
                            <MaterialCommunityIcons name='restart' size={20} color="white" />
                        </TouchableOpacity>
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
    const { t } = useTranslation();

    const duaData = [
        { arabic: "اللَّهُمَّ أَذْهِبْ غَيْظَ قَلْبِي",
        english: t('dua1'),
        pronunciation: "Allahumma azhib Gaydha Qalbee.",
        },
        { arabic: "اللهم إن كان هذا الأمر خيرا لي فَاقْدُرْهُ لِي وَيَسِّرْهُ لِي ثُمَّ بَارِكْ لِي فِيهِ",
        english: t('dua2'),
        pronunciation: "Allahumma in kaana haatha alAmr khayran lee fa iQ-dirhu lee wa yassirhu lee summa baarik lee feehi.",
        },
        { arabic: "اللهم طهر قلبي من كل سوء ، اللهم طهر قلبي من كل ما يبغضك، اللهم طهر قلبي من كل غلٍ وحقدٍ وحسد وكبر",
        english: t('dua3'),
        pronunciation: "Allahumma Tahhir Qalbee min kulli suu, Allahumma Tahhir Qalbee min kulli maa yubaGGiDuk. Allahumma Tahhir Qalbee min kulli Gillin wa HiQdin wa Hasadin wa kibr.",
        },
        { arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ الْهَمِّ وَالْحُزْنِ وَالْعَجْزِ وَالْكَسَلِ وَالْبُخْلِ وَالْجُبْنِ وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ",
        english: t('dua4'),
        pronunciation: "Allahumma innee a3uzubika min alham wa alhuzn wa al3ajz wa alkusl wa albukhl wa aljubn wa galbah aldayn wa Galbah alrijaal.",
        },
        { arabic: "اللهمّ فارج الهم، كاشف الغم، مذهب الحزن، اكشف اللهمّ عنّي همّي وغمّي ، وأذهب عنّي حزني",
        english: t('dua5'),
        pronunciation: "Allahumma Faarij alhamm, kaashif alGamm, muzhib alhuzn, ikshif Allahumma 3annee hammee wa Gammee, wa azhib 3annee huznee.",
        },
        { arabic: "اللهمّ اجعل في قلبي نوراً، وفي لساني نوراً، واجعل في سمعي نوراً، واجعل في بصري نوراً، واجعل من خلفي نوراً، ومن أمامي نوراً، واجعل من فوقي نوراً، ومن تحتي نوراً، اللهمّ أعطني نوراً",
        english: t('dua6'),
        pronunciation: "Allahumma Ij3al fee qalbee noora, wa fee lisaanee noora, wa ij3al fee sam3ee noora, wa ij3al fee baSaree noora, wa ij3al min khalfee noora, wa min amaamee noora, wa ij3al min fawqee nooraa, wa mmin tahtee noora, Allahumma a3Tinee noora.",
        },
        { arabic: "اللهم إني أعوذ بك من شر سمعي، ومن شر بصري، ومن شر لساني، ومن شر قلبي، ومن شر منيي",
        english: t('dua7'),
        pronunciation: "Allahumma innee a3uzubika min sharri sam3ee, wa min sharri baSaree, wa min sharri lisaanee, wa min sharri qalbee, wa min sharri minnee.",
        },
        { arabic: "اللهم اخرجني من الظلمات إلى النور",
        english: t('dua8'),
        pronunciation: "Allahumma Akhrijnee min aldulumaat ilaa alnur.",
        },
        { arabic: "اللهم إليك أشكو ضعف قوتي وقلة حيلتي وهواني على الناس يا أرحم الراحمين أنت ربُّ المستضعفين وانت ربّي",
        english: t('dua9'),
        pronunciation: "Allahuma ilayka ashku da'fa quwwati wa qillata heelatee wa hawanee 3ala an-naas ya arhamur rahimeen annta Rabbul mustad'afeen wa anta rabbi.",
        },
        { arabic: "اللهم امنحني القوة لأقاوم نفسي، والشجاعة لأواجه ضعفي، واليقين لأتقبل قدري، والرضا ليرتاح عقلي، والفهم ليطمئن قلبي",
        english: t('dua10'),
        pronunciation: "Allahumma imnaHnee alQuwwah li aQwaami nafseee, wa ash-Shujaa3ah li uwaajih da3fee, wa alYaqeeni li ataQabbal qadree, wa ar-riDaa li yartaah 3aQalee, wa alfahm li yaTmainna Qalbee.",
        },
    ];

    const dhikrData = [
        { arabic: "سُبْحَانَ اللّهِ",
        english: t('dhikr1'),
        pronunciation: "Subhanallah",
        title: "Tasbih",
        },
        { arabic: "الْحَمْدُ لِلّهِ",
        english: t('dhikr2'),
        pronunciation: "Alhamdulillah",
        title: "Tahmid",
        },
        { arabic: "اللّهُ أَكْبَرُ",
        english: t('dhikr3'),
        pronunciation: "Allahu Akbar",
        title: "Takbir",
        },
        { arabic: "لا إِلٰهَ إِلَّا اللهُ",
        english: t('dhikr4'),
        pronunciation: "La ilaha illallah",
        title: "Tahlil",
        },
        { arabic: "أَسْتَغْفِرُ اللهَ",
        english: t('dhikr5'),
        pronunciation: "Astaghfirullah",
        title: "Istighfar",
        },
    ];

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
            <View style={{ marginTop: height_scale * 2, alignItems:'center'}}>
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
      padding: width_scale * 3.7,
      marginHorizontal: width_scale * 3.7,
      borderRadius: 8,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
      marginTop: height_scale * 1.5,
    },
    arabicText: {
      fontSize: width_scale * 4.7,
      textAlign: 'right',
      //fontFamily: 'Traditional Arabic',
      marginBottom: height_scale * 0.8,
    },
    englishText: {
      fontSize: width_scale * 3.7,
      marginBottom: height_scale * 0.6,
    },
    pronunciationText: {
      fontSize: width_scale * 3.3,
      color: 'gray',
    },
    buttonContainer: {
        marginTop: height_scale,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    counterButton: {
        backgroundColor: '#0e9d87',
        borderRadius: 20,
        height: width_scale * 9.4,
        width: width_scale * 9.4,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: width_scale * 4,
    },
    resetButton: {
        backgroundColor: 'red',
        borderRadius: 20,
        height: width_scale * 9.4,
        width: width_scale * 9.4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: width_scale * 3.7,
    },
    boldTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: height_scale,
    },
    addButtonLabel: {
        color: 'gray',
        fontSize: width_scale * 3.3,
        marginBottom: height_scale * 0.5,
    },
    counterContainer: {
        alignItems: 'flex-end',
        marginTop: height_scale,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: height_scale * 0.5,
    },
  });