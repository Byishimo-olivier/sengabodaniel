import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Sidebar = ({ isOpen = false }) => {
   if (!localStorage.getItem('user')) {
        window.location.href = '/login';
    }
    const [alertsCount, setAlertsCount] = useState(0);
    const [expandedSections, setExpandedSections] = useState({
        products: false,
        reports: false
    });
    const API_BASE_URL = 'http://localhost:5050/api';
    
    useEffect(() => {
        let mounted = true;
        const fetchCount = async () => {
            try {
                const { data } = await axios.get(`${API_BASE_URL}/alerts/count`);
                if (mounted) setAlertsCount(data.count || 0);
            } catch (e) {
                // ignore
            }
        };
        fetchCount();
        const id = setInterval(fetchCount, 30000);
        return () => { mounted = false; clearInterval(id); };
    }, []);
    
    function logout() {
        localStorage.removeItem('user');
        window.location.href = '/login';
    }

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const NavLink = ({ to, children, icon, onClick, badge }) => (
        <Link
            to={to}
            className="flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-200 group"
            onClick={() => {
                onClick?.();
            }}
        >
            <div className="flex items-center gap-3">
                {icon && <span className="text-gray-400 group-hover:text-white">{icon}</span>}
                <span>{children}</span>
            </div>
            {badge && (
                <span className="inline-flex items-center justify-center rounded-full bg-yellow-500 text-black text-xs font-bold px-2 py-0.5">
                    {badge}
                </span>
            )}
        </Link>
    );

    const SectionHeader = ({ children, icon, expanded, onToggle }) => (
        <button
            onClick={onToggle}
            className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold text-gray-400 hover:text-white transition-colors duration-200"
        >
            <div className="flex items-center gap-3">
                {icon && <span>{icon}</span>}
                <span>{children}</span>
            </div>
            <svg
                className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </button>
    );

    const SubNavLink = ({ to, children, onClick }) => (
        <Link
            to={to}
            className="flex items-center px-8 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 ml-4"
            onClick={() => {
                onClick?.();
            }}
        >
            <span className="w-2 h-2 bg-gray-600 rounded-full mr-3"></span>
            {children}
        </Link>
    );

    return (
        <>
            {/* Sidebar Content */}
            <aside
                className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0
                    w-72 bg-gradient-to-b from-gray-900 via-gray-900 to-black shadow-2xl
                    transition-transform duration-300 ease-in-out z-40 md:z-auto overflow-y-auto`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-800">
                        <h2 className="text-2xl font-bold text-white">
                            <span className="text-blue-400">S</span>IMS
                        </h2>
                        <p className="text-xs text-gray-400 mt-1">Stock Inventory Management</p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {/* Dashboard */}
                        <NavLink 
                            to="/" 
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                                </svg>
                            }
                        >
                            Dashboard
                        </NavLink>

                        <div className="pt-4">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-3">
                                Management
                            </div>

                            {/* Manage Users */}
                            <NavLink 
                                to="/users" 
                                icon={
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                }
                            >
                                Manage Users
                            </NavLink>

                            {/* Products Section */}
                            <SectionHeader
                                icon={
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                }
                                expanded={expandedSections.products}
                                onToggle={() => toggleSection('products')}
                            >
                                Products
                            </SectionHeader>
                            
                            {expandedSections.products && (
                                <div className="space-y-1">
                                    <SubNavLink to="/add-part">Add Product</SubNavLink>
                                    <SubNavLink to="/spare-parts-list">View Products</SubNavLink>
                                    <SubNavLink to="/stock-in">Record Stock In</SubNavLink>
                                    <SubNavLink to="/stock-out">Record Stock Out</SubNavLink>
                                </div>
                            )}

                            {/* Reports Section */}
                            <SectionHeader
                                icon={
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                }
                                expanded={expandedSections.reports}
                                onToggle={() => toggleSection('reports')}
                            >
                                Reports
                            </SectionHeader>
                            
                            {expandedSections.reports && (
                                <div className="space-y-1">
                                    <SubNavLink to="/stock-in-list">Stock In Report</SubNavLink>
                                    <SubNavLink to="/stock-out-list">Stock Out Report</SubNavLink>
                                </div>
                            )}

                            {/* Manufacturers */}
                            <NavLink 
                                to="/manufacturers" 
                                icon={
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                }
                            >
                                Manufacturers
                            </NavLink>
                        </div>

                        <div className="pt-4">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-3">
                                System
                            </div>

                            {/* Alerts */}
                            <NavLink 
                                to="/alerts" 
                                icon={
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.868 19.462A17.173 17.173 0 003 12C3 5.373 8.373 0 15 0s12 5.373 12 12c0 2.537-.786 4.884-2.124 6.826" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a3 3 0 11-6 0 3 3 0 016 0zM13 14a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                }
                                badge={alertsCount > 0 ? alertsCount : null}
                            >
                                Alerts
                            </NavLink>
                        </div>
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-800">
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile when sidebar is open */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 z-30 md:hidden"
                    onClick={() => {}}
                ></div>
            )}
        </>
    );
};

export default Sidebar;
