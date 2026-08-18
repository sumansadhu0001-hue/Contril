import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { 
  OperatingMode, 
  DecisionItem, 
  AutoCompletedTask, 
  MemoryItem, 
  DocumentItem, 
  MeetingItem, 
  EmailItem, 
  UserProfile
} from './types';
import { 
  initialDecisions, 
  initialAutoCompletedTasks, 
  initialMemoryBank, 
  initialDocuments, 
  initialMeetings, 
  initialEmails 
} from './initialData';

// NEW PRODUCTION-QUALITY FRONTEND LAYER (src/ui)
import { AppShell } from './ui/shell/AppShell';
import { TodayView } from './ui/today/TodayView';
import { InboxView } from './ui/inbox/InboxView';
import { MeetingsView } from './ui/meetings/MeetingsView';
import { DocumentsView } from './ui/documents/DocumentsView';
import { MemoryView } from './ui/memory/MemoryView';
import { IntegrationsView } from './ui/integrations/IntegrationsView';
import { SettingsView } from './ui/settings/SettingsView';
import { AuthView } from './ui/auth/AuthView';
import { OnboardingView } from './ui/onboarding/OnboardingView';
import { WorkspaceView } from './ui/workspace/WorkspaceView';

// PUBLIC WEBSITE VIEWS
import { PublicNavbar } from './ui/public/PublicNavbar';
import { PublicFooter } from './ui/public/PublicFooter';
import { LandingView } from './ui/public/LandingView';
import { AboutView } from './ui/public/AboutView';
import { HowItWorksView } from './ui/public/HowItWorksView';
import { DownloadView } from './ui/public/DownloadView';
import { InfoPages } from './ui/public/InfoPages';
import { AtmosphericBackground } from './components/AtmosphericBackground';

// Device Detection
import { detectDevice, DeviceInfo } from './lib/deviceDetection';

// Preserved Logic, Stores, Modals & Handlers
import { getLocalSession, setLocalSession, logoutUser, AuthUser, supabase } from './lib/auth';
import { checkAndVerifyGmailConnection } from './lib/gmailAuthService';
import { getConnectedAccounts, getLiveSyncedData, hydrateIntegrationsStatus } from './lib/integrationsStore';
import { ChatView } from './components/ChatView';
import { createNewConversation, getActiveConversationId, setActiveConversationId as saveActiveConvId } from './lib/chatStore';
import { SpotlightModal } from './components/SpotlightModal';
import { DailyVoiceBriefingModal } from './components/DailyVoiceBriefingModal';
import { AdminInquiriesDashboard } from './components/AdminInquiriesDashboard';
import { AdminErrorBoundary } from './components/AdminErrorBoundary';
import { CrashReportingService } from './backend/telemetry/CrashReportingService';
import { ThemePreference, getStoredThemePreference, saveThemePreference, applyTheme, subscribeToSystemThemeChanges } from './lib/theme';
import { usePageSeo } from './hooks/usePageSeo';
import { Loader2 } from 'lucide-react';

let globalAuthLifecycleStarted = false;

export default function App() {
  const shouldReduceMotion = useReducedMotion();
  const [deviceInfo] = useState<DeviceInfo>(() => detectDevice());

  // URL / Route synchronization
  const parseCurrentRoute = (): string => {
    const pathname = window.location.pathname.replace(/^\/+|\/+$/g, '');
    const hash = window.location.hash.replace(/^#\/?/, '');
    
    // Priority to hash if present, otherwise pathname
    const active = hash || pathname;
    if (!active) return '/';
    return active;
  };

  const [currentRoute, setCurrentRoute] = useState<string>(parseCurrentRoute);

  // Dynamic SEO Metadata (Per-Page Title, Meta Description, Canonical URL, OpenGraph)
  usePageSeo(currentRoute);

  // Authenticated internal operating mode
  const [appMode, setAppMode] = useState<OperatingMode>('focus');
  const [activeChatPrompt, setActiveChatPrompt] = useState<string | undefined>(undefined);
  const [activeConvId, setActiveConvId] = useState<string | null>(() => getActiveConversationId());

  // Theme state
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => getStoredThemePreference());

  const handleSelectThemePreference = (pref: ThemePreference) => {
    setThemePreference(pref);
    saveThemePreference(pref);
    applyTheme(pref);
  };

  useEffect(() => {
    applyTheme(themePreference);
    const unsubscribe = subscribeToSystemThemeChanges(() => {
      if (themePreference === 'system') applyTheme('system');
    });
    return () => unsubscribe();
  }, [themePreference]);

  // Auth Session State
  const [sessionUser, setSessionUser] = useState<AuthUser | null>(getLocalSession());
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(() => Boolean(supabase));
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('contril_onboarding_completed') !== 'true';
  });

  // Admin Route Detection
  const [isAdminView, setIsAdminView] = useState(() => {
    return window.location.pathname === '/admin' || window.location.pathname === '/admin/login' || window.location.hash === '#admin';
  });

  // Navigation router
  const navigateTo = (target: string, extraId?: string) => {
    let cleanTarget = target.replace(/^#\/?/, '').replace(/^\/+/, '');
    if (!cleanTarget) cleanTarget = '/';

    // If navigating to an authenticated app submode
    const appSubModes: OperatingMode[] = ['focus', 'workspace', 'inbox', 'meetings', 'docs', 'memory', 'settings', 'profile', 'chat'];
    if (appSubModes.includes(cleanTarget as OperatingMode)) {
      setAppMode(cleanTarget as OperatingMode);
      cleanTarget = 'app';
    }

    // Auth gate for /app
    if (cleanTarget === 'app' && !sessionUser) {
      cleanTarget = 'login';
    }

    setCurrentRoute(cleanTarget);

    const fullUrl = cleanTarget === '/' ? '/' : `/${cleanTarget}${extraId ? `/${extraId}` : ''}`;
    const fullHash = cleanTarget === '/' ? '' : `#${cleanTarget}${extraId ? `/${extraId}` : ''}`;
    window.history.pushState(null, '', fullHash || fullUrl);
  };

  // Android device auto-redirection on initial visit to root '/'
  useEffect(() => {
    const isRoot = currentRoute === '/' || currentRoute === '';
    const hasSkipped = sessionStorage.getItem('contril_skip_android_redirect');
    if (deviceInfo.isAndroidPhone && isRoot && !hasSkipped) {
      sessionStorage.setItem('contril_skip_android_redirect', 'true');
      navigateTo('download/android');
    }
  }, [deviceInfo]);

  useEffect(() => {
    const handleLocationChange = () => {
      if (window.location.pathname === '/admin' || window.location.pathname === '/admin/login' || window.location.hash === '#admin') {
        setIsAdminView(true);
      } else {
        setIsAdminView(false);
        const route = parseCurrentRoute();
        setCurrentRoute(route);
      }
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Supabase Auth Lifecycle
  useEffect(() => {
    if (globalAuthLifecycleStarted) return;
    globalAuthLifecycleStarted = true;

    if (!supabase) {
      setIsLoadingAuth(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const mappedUser: AuthUser = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          provider: session.user.app_metadata?.provider,
          createdAt: session.user.created_at
        };
        setSessionUser(mappedUser);
        setLocalSession(mappedUser);
      }
      setIsLoadingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const mappedUser: AuthUser = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          provider: session.user.app_metadata?.provider,
          createdAt: session.user.created_at
        };
        setSessionUser(mappedUser);
        setLocalSession(mappedUser);
      } else {
        setSessionUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Profile and data state
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const session = getLocalSession();
    return {
      name: session?.name || '',
      workspaceType: 'business',
      company: session?.companyOrName || 'Personal Workspace',
      role: session?.identityType || 'Executive',
      connectedTools: ['gmail', 'google_calendar', 'google_drive']
    };
  });

  const initialSynced = getLiveSyncedData(getConnectedAccounts());
  const [decisions, setDecisions] = useState<DecisionItem[]>(() => initialSynced.decisions);
  const [memoryBank] = useState<MemoryItem[]>(() => {
    try {
      const raw = localStorage.getItem('contril_user_memory_bank_v1');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });
  const [documents, setDocuments] = useState<DocumentItem[]>(() => initialSynced.documents);
  const [meetings, setMeetings] = useState<MeetingItem[]>(() => initialSynced.meetings);
  const [emails, setEmails] = useState<EmailItem[]>(() => initialSynced.emails);

  const refreshLiveData = () => {
    const live = getLiveSyncedData(getConnectedAccounts());
    setDecisions(live.decisions);
    setMeetings(live.meetings);
    setDocuments(live.documents);
    setEmails(live.emails);
  };

  useEffect(() => {
    if (sessionUser) {
      hydrateIntegrationsStatus()
        .then(() => checkAndVerifyGmailConnection())
        .then(() => refreshLiveData())
        .catch(err => console.error('[App] Failed to verify integrations:', err));
    }
  }, [sessionUser]);

  // Modals state
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isVoiceBriefingOpen, setIsVoiceBriefingOpen] = useState(false);

  const handleStartChat = (promptText: string) => {
    const newConv = createNewConversation(promptText);
    setActiveConvId(newConv.id);
    saveActiveConvId(newConv.id);
    setActiveChatPrompt(promptText);
    setAppMode('chat');
    navigateTo('app', newConv.id);
  };

  const handleAuthComplete = (user: AuthUser) => {
    setSessionUser(user);
    setLocalSession(user);
    setUserProfile(prev => ({
      ...prev,
      name: user.name || user.email.split('@')[0]
    }));
    navigateTo('app');
  };

  const handleOnboardingComplete = (data: any) => {
    if (data) {
      setUserProfile(prev => ({
        ...prev,
        name: data.fullName || prev.name,
        company: data.companyName || prev.company
      }));
      if (data.theme) handleSelectThemePreference(data.theme);
    }
    localStorage.setItem('contril_onboarding_completed', 'true');
    setShowOnboarding(false);
    navigateTo('app');
  };

  const handleLogout = () => {
    logoutUser();
    setSessionUser(null);
    navigateTo('/');
  };

  // ---------------------------------------------------------------------------
  // RENDER ROUTING
  // ---------------------------------------------------------------------------

  // 1. Admin Portal
  if (isAdminView) {
    return (
      <AdminErrorBoundary onBackToApp={() => { setIsAdminView(false); navigateTo('/'); }}>
        <AdminInquiriesDashboard onBackToApp={() => { setIsAdminView(false); navigateTo('/'); }} />
      </AdminErrorBoundary>
    );
  }

  // 2. Auth Routes: /login, /signup, /forgot-password
  if (currentRoute === 'login' || currentRoute === 'signup' || currentRoute === 'forgot-password') {
    if (sessionUser) {
      navigateTo('app');
    }
    return (
      <AuthView
        onAuthComplete={handleAuthComplete}
        onBackToHome={() => navigateTo('/')}
      />
    );
  }

  // 3. Authenticated App Experience: /app (or internal sub-modes)
  if (currentRoute === 'app' || ['focus', 'workspace', 'inbox', 'meetings', 'docs', 'memory', 'settings', 'profile', 'chat'].includes(currentRoute)) {
    if (!sessionUser) {
      return (
        <AuthView
          onAuthComplete={handleAuthComplete}
          onBackToHome={() => navigateTo('/')}
        />
      );
    }

    if (showOnboarding) {
      return <OnboardingView onComplete={handleOnboardingComplete} />;
    }

    return (
      <AppShell
        currentMode={appMode}
        onSelectMode={(mode) => {
          if (mode === '/') navigateTo('/');
          else {
            setAppMode(mode as OperatingMode);
            navigateTo('app');
          }
        }}
        userProfile={userProfile}
        themePreference={themePreference}
        onSelectThemePreference={handleSelectThemePreference}
        onOpenSpotlight={() => setIsSpotlightOpen(true)}
        onOpenVoiceBriefing={() => setIsVoiceBriefingOpen(true)}
        onOpenSettings={() => setAppMode('profile')}
        meetings={meetings}
        emails={emails}
        documents={documents}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={appMode}
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="w-full flex-1"
          >
            {appMode === 'focus' && (
              <TodayView
                userProfile={userProfile}
                meetings={meetings}
                emails={emails}
                recentDocs={documents}
                onSelectMode={(mode) => setAppMode(mode as OperatingMode)}
                onOpenSpotlight={() => setIsSpotlightOpen(true)}
                onOpenVoiceBriefing={() => setIsVoiceBriefingOpen(true)}
                onStartChat={handleStartChat}
              />
            )}

            {appMode === 'workspace' && (
              <WorkspaceView
                userProfile={userProfile}
                decisions={decisions}
                documents={documents}
                meetings={meetings}
                onSelectMode={(mode) => setAppMode(mode as OperatingMode)}
              />
            )}

            {appMode === 'inbox' && (
              <InboxView
                emails={emails}
                onSendReply={(id, text) => console.info(`Reply to ${id}: ${text}`)}
                onOpenSettings={() => setAppMode('settings')}
              />
            )}

            {appMode === 'meetings' && (
              <MeetingsView
                meetings={meetings}
                onAddMeetingIntelligence={(id, intel) => {
                  setMeetings(prev => prev.map(m => m.id === id ? { ...m, intelligence: intel } : m));
                }}
              />
            )}

            {appMode === 'docs' && (
              <DocumentsView
                documents={documents}
                onOpenSettings={() => setAppMode('settings')}
              />
            )}

            {appMode === 'memory' && (
              <MemoryView
                memoryItems={memoryBank}
                onOpenSettings={() => setAppMode('settings')}
              />
            )}

            {appMode === 'settings' && (
              <IntegrationsView
                onBack={() => setAppMode('focus')}
                onDataChanged={refreshLiveData}
              />
            )}

            {appMode === 'profile' && (
              <SettingsView
                userProfile={userProfile}
                themePreference={themePreference}
                onSelectThemePreference={handleSelectThemePreference}
                onResetOnboarding={() => {
                  localStorage.removeItem('contril_onboarding_completed');
                  setShowOnboarding(true);
                }}
                onLogout={handleLogout}
              />
            )}

            {appMode === 'chat' && (
              <div className="max-w-5xl mx-auto py-4 px-4 sm:px-6">
                <ChatView
                  conversationId={activeConvId}
                  userProfile={userProfile}
                  initialPrompt={activeChatPrompt}
                  onBack={() => {
                    setActiveChatPrompt(undefined);
                    setAppMode('focus');
                  }}
                  onSelectConversation={(id) => {
                    setActiveConvId(id);
                    saveActiveConvId(id);
                    setActiveChatPrompt(undefined);
                  }}
                  onOpenSpotlight={() => setIsSpotlightOpen(true)}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <SpotlightModal
          isOpen={isSpotlightOpen}
          onClose={() => setIsSpotlightOpen(false)}
          memoryItems={memoryBank}
          onSelectMode={(mode) => setAppMode(mode as OperatingMode)}
        />

        <DailyVoiceBriefingModal
          isOpen={isVoiceBriefingOpen}
          onClose={() => setIsVoiceBriefingOpen(false)}
          userProfile={userProfile}
        />
      </AppShell>
    );
  }

  // 4. Public Experience: Landing, About, How It Works, Download & Info Pages
  return (
    <div className="min-h-screen text-[#0B1220] dark:text-[#F8FAFC] flex flex-col font-sans transition-colors duration-200 relative">
      <AtmosphericBackground />

      <PublicNavbar
        onNavigate={navigateTo}
        currentRoute={currentRoute}
        isAuthenticated={Boolean(sessionUser)}
        themePreference={themePreference}
        onSelectThemePreference={handleSelectThemePreference}
      />

      <main className="flex-1 relative z-10">
        {currentRoute === 'about' ? (
          <AboutView
            onNavigate={navigateTo}
            isAuthenticated={Boolean(sessionUser)}
          />
        ) : (currentRoute === 'how-it-works' || currentRoute === 'features') ? (
          <HowItWorksView
            onNavigate={navigateTo}
            isAuthenticated={Boolean(sessionUser)}
          />
        ) : (currentRoute === 'download' || currentRoute === 'download/android') ? (
          <DownloadView
            onNavigate={navigateTo}
            isAuthenticated={Boolean(sessionUser)}
            deviceInfo={deviceInfo}
          />
        ) : ['privacy', 'terms'].includes(currentRoute) ? (
          <InfoPages
            page={currentRoute as any}
            onNavigate={navigateTo}
            isAuthenticated={Boolean(sessionUser)}
          />
        ) : (
          <LandingView
            deviceInfo={deviceInfo}
            onNavigate={navigateTo}
            isAuthenticated={Boolean(sessionUser)}
          />
        )}
      </main>

      <PublicFooter onNavigate={navigateTo} />
    </div>
  );
}
