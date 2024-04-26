import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const NamesOfAllah = [
    { name: "Ar-Rahman", meaning: "The Beneficent" },
    { name: "Ar-Raheem", meaning: "The Merciful" },
    { name: "Al-Malik", meaning: "The King" },
    { name: "Al-Quddus", meaning: "The Most Holy" },
    { name: "As-Salam", meaning: "The Giver of Peace" },
    { name: "Al-Mumin", meaning: "The Infuser of Faith" },
    { name: "Al-Muhaymin", meaning: "The Guardian" },
    { name: "Al-Aziz", meaning: "The Mighty One" },
    { name: "Al-Jabbar", meaning: "The All Compelling" },
    { name: "Al-Mutakabbir", meaning: "The Dominant One" },
    { name: "Al-Khaliq", meaning: "The Creator" },
    { name: "Al-Bari", meaning: "The Maker" },
    { name: "Al-Musawwir", meaning: "The Flawless Shaper" },
    { name: "Al-Ghaffar", meaning: "The Great Forgiver" },
    { name: "Al-Qahhar", meaning: "The All-Prevailing One" },
    { name: "Al-Wahhab", meaning: "The Supreme Bestower" },
    { name: "Ar-Razzaq", meaning: "The Total Provider" },
    { name: "Al-Fattah", meaning: "The Opener" },
    { name: "Al-Alim", meaning: "The All-Knowing One" },
    { name: "Al-Qabid", meaning: "The Restricting One" },
    { name: "Al-Basit", meaning: "The Extender" },
    { name: "Al-Khafid", meaning: "The Reducer" },
    { name: "Ar-Rafi", meaning: "The Elevating One" },
    { name: "Al-Mu'izz", meaning: "The Honourer-Bestower" },
    { name: "Al-Muzil", meaning: "The Abaser" },
    { name: "As-Sami", meaning: "The All-Hearer" },
    { name: "Al-Baseer", meaning: "The All-Seeing" },
    { name: "Al-Hakam", meaning: "The Impartial Judge" },
    { name: "Al-Adl", meaning: "The Embodiment of Justice" },
    { name: "Al-Lateef", meaning: "The Knower of Subtleties" },
    { name: "Al-Khabir", meaning: "The All-Aware One" },
    { name: "Al-Haleem", meaning: "The Clement One" },
    { name: "Al-Azeem", meaning: "The Magnificent One" },
    { name: "Al-Ghafoor", meaning: "The All-Forgiving" },
    { name: "Ash-Shakur", meaning: "The Acknowledging One" },
    { name: "Al-Aliyy", meaning: "The Sublime One" },
    { name: "Al-Kabeer", meaning: "The Great One" },
    { name: "Al-Hafiz", meaning: "The Guarding One" },
    { name: "Al-Muqeet", meaning: "The Sustaining One" },
    { name: "Al-Haseeb", meaning: "The Reckoning One" },
    { name: "Al-Jaleel", meaning: "The Majestic One" },
    { name: "Al-Karim", meaning: "The Bountiful One" },
    { name: "Ar-Raqib", meaning: "The Watchful One" },
    { name: "Al-Mujeeb", meaning: "The Responding One" },
    { name: "Al-Wasi", meaning: "The All-Pervading One" },
    { name: "Al-Hakeem", meaning: "The Wise One" },
    { name: "Al-Wadud", meaning: "The Loving One" },
    { name: "Al-Majeed", meaning: "The Glorious One" },
    { name: "Al-Ba'ith", meaning: "The Infuser of New Life" },
    { name: "Ash-Shaheed", meaning: "The All Observing Witness" },
    { name: "Al-Haqq", meaning: "The Embodiment of Truth" },
    { name: "Al-Wakeel", meaning: "The Universal Trustee" },
    { name: "Al-Qawiyy", meaning: "The Strong One" },
    { name: "Al-Matin", meaning: "The Firm One" },
    { name: "Al-Waliy", meaning: "The Protecting Associate" },
    { name: "Al-Hameed", meaning: "The Sole-Laudable One" },
    { name: "Al-Muhsi", meaning: "The All-Enumerating One" },
    { name: "Al-Mubdi", meaning: "The Originator" },
    { name: "Al-Muid", meaning: "The Restorer" },
    { name: "Al-Muhyi", meaning: "The Maintainer of Life" },
    { name: "Al-Mumeet", meaning: "The Inflictor of Death" },
    { name: "Al-Hayy", meaning: "The Eternally Living One" },
    { name: "Al-Qayyum", meaning: "The Self-Subsisting One" },
    { name: "Al-Wajid", meaning: "The Pointing One" },
    { name: "Al-Maajid", meaning: "The All-Noble One" },
    { name: "Al-Wahid", meaning: "The Only One" },
    { name: "Al-Ahad", meaning: "The Sole One" },
    { name: "As-Samad", meaning: "The Supreme Provider" },
    { name: "Al-Qadir", meaning: "The All-Powerful" },
    { name: "Al-Muqtadir", meaning: "The All Authoritative One" },
    { name: "Al-Muqaddim", meaning: "The Expediting One" },
    { name: "Al-Muakhkhir", meaning: "The Delayer" },
    { name: "Al-Awwal", meaning: "The Very First" },
    { name: "Al-Akhir", meaning: "The Infinite Last One" },
    { name: "Az-Zaahir", meaning: "The Perceptible" },
    { name: "Al-Baatin", meaning: "The Imperceptible" },
    { name: "Al-Wali", meaning: "The Holder of Supreme Authority" },
    { name: "Al-Mutaali", meaning: "The Extremely Exalted One" },
    { name: "Al-Barr", meaning: "The Fountain-Head of Truth" },
    { name: "At-Tawwab", meaning: "The Ever-Acceptor of Repentance" },
    { name: "Al-Muntaqim", meaning: "The Retaliator" },
    { name: "Al-Afuww", meaning: "The Supreme Pardoner" },
    { name: "Malikul-Mulk", meaning: "The Eternal Possessor of Sovereignty" },
    { name: "Dhul-Jalali wal-Ikram", meaning: "The Lord of Majesty and Honour" },
    { name: "Al-Muqsit", meaning: "The Just One" },
    { name: "Al-Jami", meaning: "The Assembler of Scattered Creations" },
    { name: "Al-Ghaniy", meaning: "The Self-Sufficient One" },
    { name: "Al-Mughni", meaning: "The Enricher" },
    { name: "Al-Mani", meaning: "The Preventer" },
    { name: "Ad-Darr", meaning: "The Distressor" },
    { name: "An-Nafi", meaning: "The Bestower of Benefits" },
    { name: "An-Noor", meaning: "The Prime Light" },
    { name: "Al-Hadi", meaning: "The Provider of Guidance" },
    { name: "Al-Badi", meaning: "The Unique One" },
    { name: "Al-Baaqi", meaning: "The Ever Surviving One" },
    { name: "Al-Warith", meaning: "The Eternal Inheritor" },
    { name: "Ar-Rasheed", meaning: "The Guide to Path of Rectitude" },
    { name: "As-Sabur", meaning: "The Extensively Enduring One" },
]

export default NamesScreen = () => {
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