import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null); // { handle, avatar, silk, role, status }
    const [currentScreen, setCurrentScreen] = useState('splash'); // splash, auth, dashboard, chapel, passport, ships
    const [activeWedding, setActiveWedding] = useState(null);
    const [inventory, setInventory] = useState([]);
    const [marriages, setMarriages] = useState([]);
    const [receivedProposals, setReceivedProposals] = useState([]);
    const [sentProposals, setSentProposals] = useState([]);

    // Mock data for initial demo
    useEffect(() => {
        // Initial loading simulation
        const timer = setTimeout(() => {
            if (currentScreen === 'splash') setCurrentScreen('auth');
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    // Мокаем входящее предложение для теста через 10 секунд после логина
    useEffect(() => {
        if (user && receivedProposals.length === 0) {
            const timer = setTimeout(() => {
                setReceivedProposals([{
                    id: Date.now(),
                    from: 'zuck',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zuck',
                    date: new Date().toLocaleDateString('ru-RU')
                }]);
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [user]);

    const login = (handle) => {
        setUser({
            handle: handle,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${handle}`,
            silk: 100,
            role: 'Моногам',
            status: 'Свободен'
        });
        setCurrentScreen('dashboard');
    };

    const sendProposal = (partnerData) => {
        setSentProposals([{ ...partnerData, id: Date.now() }, ...sentProposals]);
    };

    const acceptProposal = (proposal) => {
        setReceivedProposals(receivedProposals.filter(p => p.id !== proposal.id));
        startWedding({
            handle: proposal.from,
            avatar: proposal.avatar
        });
    };

    const rejectProposal = (id) => {
        setReceivedProposals(receivedProposals.filter(p => p.id !== id));
    };

    const startWedding = (partnerData) => {
        setActiveWedding({
            partner: partnerData.handle,
            partnerAvatar: partnerData.avatar,
            style: 'Кибер-ЗАГС',
            date: new Date().toLocaleDateString('ru-RU')
        });
        setCurrentScreen('chapel');
    };

    const completeWedding = () => {
        if (activeWedding) {
            setMarriages([activeWedding, ...marriages]);
            setUser(prev => ({
                ...prev,
                status: `В союзе с @${activeWedding.partner}`,
                silk: prev.silk + 50 // Награда за союз
            }));
            setActiveWedding(null);
            setCurrentScreen('certificate');
        }
    };

    return (
        <AppContext.Provider value={{
            user, setUser,
            currentScreen, setCurrentScreen,
            inventory, setInventory,
            marriages, setMarriages,
            receivedProposals, sentProposals,
            activeWedding, startWedding, completeWedding,
            sendProposal, acceptProposal, rejectProposal,
            login
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
