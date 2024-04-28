import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

export default NamesScreen = () => {
    const { t } = useTranslation();

    const NamesOfAllah = [
      { name: "Ar-Rahman", meaning: t('name1') },
      { name: "Ar-Raheem", meaning: t('name2') },
      { name: "Al-Malik", meaning: t('name3') },
      { name: "Al-Quddus", meaning: t('name4') },
      { name: "As-Salam", meaning: t('name5') },
      { name: "Al-Mumin", meaning: t('name6') },
      { name: "Al-Muhaymin", meaning: t('name7') },
      { name: "Al-Aziz", meaning: t('name8') },
      { name: "Al-Jabbar", meaning: t('name9') },
      { name: "Al-Mutakabbir", meaning: t('name10') },
      { name: "Al-Khaliq", meaning: t('name11') },
      { name: "Al-Bari", meaning: t('name12') },
      { name: "Al-Musawwir", meaning: t('name13') },
      { name: "Al-Ghaffar", meaning: t('name14') },
      { name: "Al-Qahhar", meaning: t('name15') },
      { name: "Al-Wahhab", meaning: t('name16') },
      { name: "Ar-Razzaq", meaning: t('name17') },
      { name: "Al-Fattah", meaning: t('name18') },
      { name: "Al-Alim", meaning: t('name19') },
      { name: "Al-Qabid", meaning: t('name20') },
      { name: "Al-Basit", meaning: t('name21') },
      { name: "Al-Khafid", meaning: t('name22') },
      { name: "Ar-Rafi", meaning: t('name23') },
      { name: "Al-Mu'izz", meaning: t('name24') },
      { name: "Al-Muzil", meaning: t('name25') },
      { name: "As-Sami", meaning: t('name26') },
      { name: "Al-Baseer", meaning: t('name27') },
      { name: "Al-Hakam", meaning: t('name28') },
      { name: "Al-Adl", meaning: t('name29') },
      { name: "Al-Lateef", meaning: t('name30') },
      { name: "Al-Khabir", meaning: t('name31') },
      { name: "Al-Haleem", meaning: t('name32') },
      { name: "Al-Azeem", meaning: t('name33') },
      { name: "Al-Ghafoor", meaning: t('name34') },
      { name: "Ash-Shakur", meaning: t('name35') },
      { name: "Al-Aliyy", meaning: t('name36') },
      { name: "Al-Kabeer", meaning: t('name37') },
      { name: "Al-Hafiz", meaning: t('name38') },
      { name: "Al-Muqeet", meaning: t('name39') },
      { name: "Al-Haseeb", meaning: t('name40') },
      { name: "Al-Jaleel", meaning: t('name41') },
      { name: "Al-Karim", meaning: t('name42') },
      { name: "Ar-Raqib", meaning: t('name43') },
      { name: "Al-Mujeeb", meaning: t('name44') },
      { name: "Al-Wasi", meaning: t('name45') },
      { name: "Al-Hakeem", meaning: t('name46') },
      { name: "Al-Wadud", meaning: t('name47') },
      { name: "Al-Majeed", meaning: t('name48') },
      { name: "Al-Ba'ith", meaning: t('name49') },
      { name: "Ash-Shaheed", meaning: t('name50') },
      { name: "Al-Haqq", meaning: t('name51') },
      { name: "Al-Wakeel", meaning: t('name52') },
      { name: "Al-Qawiyy", meaning: t('name53') },
      { name: "Al-Matin", meaning: t('name54') },
      { name: "Al-Waliy", meaning: t('name55') },
      { name: "Al-Hameed", meaning: t('name56') },
      { name: "Al-Muhsi", meaning: t('name57') },
      { name: "Al-Mubdi", meaning: t('name58') },
      { name: "Al-Muid", meaning: t('name59') },
      { name: "Al-Muhyi", meaning: t('name60') },
      { name: "Al-Mumeet", meaning: t('name61') },
      { name: "Al-Hayy", meaning: t('name62') },
      { name: "Al-Qayyum", meaning: t('name63') },
      { name: "Al-Wajid", meaning: t('name64') },
      { name: "Al-Maajid", meaning: t('name65') },
      { name: "Al-Wahid", meaning: t('name66') },
      { name: "Al-Ahad", meaning: t('name67') },
      { name: "As-Samad", meaning: t('name68') },
      { name: "Al-Qadir", meaning: t('name69') },
      { name: "Al-Muqtadir", meaning: t('name70') },
      { name: "Al-Muqaddim", meaning: t('name71') },
      { name: "Al-Muakhkhir", meaning: t('name72') },
      { name: "Al-Awwal", meaning: t('name73') },
      { name: "Al-Akhir", meaning: t('name74') },
      { name: "Az-Zaahir", meaning: t('name75') },
      { name: "Al-Baatin", meaning: t('name76') },
      { name: "Al-Wali", meaning: t('name77') },
      { name: "Al-Mutaali", meaning: t('name78') },
      { name: "Al-Barr", meaning: t('name79') },
      { name: "At-Tawwab", meaning: t('name80') },
      { name: "Al-Muntaqim", meaning: t('name81') },
      { name: "Al-Afuww", meaning: t('name82') },
      { name: "Ar-Rauf", meaning: t('name83') },
      { name: "Malikul-Mulk", meaning: t('name84') },
      { name: "Dhul-Jalali wal-Ikram", meaning: t('name85') },
      { name: "Al-Muqsit", meaning: t('name86') },
      { name: "Al-Jami", meaning: t('name87') },
      { name: "Al-Ghaniy", meaning: t('name88') },
      { name: "Al-Mughni", meaning: t('name89') },
      { name: "Al-Mani", meaning: t('name90') },
      { name: "Ad-Darr", meaning: t('name91') },
      { name: "An-Nafi", meaning: t('name92') },
      { name: "An-Noor", meaning: t('name93') },
      { name: "Al-Hadi", meaning: t('name94') },
      { name: "Al-Badi", meaning: t('name95') },
      { name: "Al-Baaqi", meaning: t('name96') },
      { name: "Al-Warith", meaning: t('name97') },
      { name: "Ar-Rasheed", meaning: t('name98') },
      { name: "As-Sabur", meaning: t('name99') },
   ];

    return (
        <ScrollView style={styles.container}>
            {NamesOfAllah.map((Name, index) => {
                return (
                    <View key={index} style={styles.nameContainer}>
                        <Text style={styles.name}>{Name.name}</Text>
                        <Text style={styles.meaning}>{Name.meaning}</Text>
                    </View>
                )
            })}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f2f1f6',
    },
    nameContainer: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#eee', 
    },
    name: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    meaning: {
      fontSize: 14,
      color: 'gray',
      marginTop: 5,
    },
  });