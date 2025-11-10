import React, { useState, useReducer, useCallback, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Portfolio, Section, Locale, DeviceView } from './types';
import { INITIAL_PORTFOLIO_DATA } from './constants';
import { TopBar } from './components/TopBar';
import { Library } from './components/Library';
import { Canvas } from './components/Canvas';
import { Inspector } from './components/Inspector';
import { ConflictWarning } from './components/ConflictWarning';
import { Menu, X, Loader2, AlertCircle } from 'lucide-react';
import { getProject, getBlocks, updateBlock, createBlock, reorderBlocks, createPage, getPages } from './services/supabaseApi';
import { useAutosave } from './hooks/useAutosave';

type PortfolioAction =
  | { type: 'INIT_PORTFOLIO'; payload: { portfolio: Portfolio } }
  | { type: 'UPDATE_SECTION'; payload: { sectionId: string; data: any } }
  | { type: 'UPDATE_SECTION_METADATA'; payload: { sectionId: string; metadata: Partial<Section> } }
  | { type: 'ADD_SECTION'; payload: { section: Section } }
  | { type: 'REMOVE_SECTION'; payload: { sectionId: string } }
  | { type: 'REORDER_SECTIONS'; payload: { startIndex: number; endIndex: number } };

function portfolioReducer(state: Portfolio, action: PortfolioAction): Portfolio {
  switch (action.type) {
    case 'INIT_PORTFOLIO':
      return action.payload.portfolio;
    case 'UPDATE_SECTION':
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.id === action.payload.sectionId ? { ...s, data: { ...s.data, ...action.payload.data } } : s
        ),
      };
    case 'UPDATE_SECTION_METADATA':
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.id === action.payload.sectionId ? { ...s, ...action.payload.metadata } : s
        ),
      };
    case 'ADD_SECTION':
      return { ...state, sections: [...state.sections, action.payload.section] };
    case 'REMOVE_SECTION':
      return { ...state, sections: state.sections.filter((s) => s.id !== action.payload.sectionId) };
    case 'REORDER_SECTIONS': {
      const result = Array.from(state.sections);
      const [removed] = result.splice(action.payload.startIndex, 1);
      result.splice(action.payload.endIndex, 0, removed);
      return { ...state, sections: result };
    }
    default:
      return state;
  }
}

export default function App() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [portfolio, dispatch] = useReducer(portfolioReducer, INITIAL_PORTFOLIO_DATA);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [activeLocale, setActiveLocale] = useState<Locale>('en');
  const [isLibraryOpen, setLibraryOpen] = useState(false);
  const [isInspectorOpen, setInspectorOpen] = useState(false);
  const [deviceView, setDeviceView] = useState<DeviceView>('desktop');
  const [justAddedSectionId, setJustAddedSectionId] = useState<string | null>(null);
  
  // Project loading state
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<any>(null);
  
  // Conflict detection
  const [showConflictWarning, setShowConflictWarning] = useState(false);

  // Load project from Supabase
  useEffect(() => {
    async function loadProject() {
      if (!projectId) {
        setLoadError('No project ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError(null);
        
        // Get project with blocks and pages
        const data = await getProject(projectId);
        
        // Ensure project has at least one page
        if (!data.pages || data.pages.length === 0) {
          const defaultPage = await createPage(projectId, '/', {});
          data.pages = [defaultPage];
        }
        
        setProjectData(data);
        
        // Convert Supabase blocks to Portfolio sections
        const sections: Section[] = [];
        
        if (data.blocks && data.blocks.length > 0) {
          // Sort blocks by order
          const sortedBlocks = [...data.blocks].sort((a, b) => a.order - b.order);
          
          for (const block of sortedBlocks) {
            sections.push({
              id: `block-${block.id}`,
              type: block.type as any,
              data: block.data?.sectionData || {},
              effects: block.data?.effects || { parallax: 0, blur: false, has3d: false },
              _strapiId: undefined,
              _strapiDocumentId: block.id, // Reuse field for UUID
              _strapiUpdatedAt: block.updated_at
            });
          }
        }
        
        // Initialize portfolio state with project data
        const initialPortfolio: Portfolio = {
          id: projectId,
          name: data.name,
          sections: sections.length > 0 ? sections : INITIAL_PORTFOLIO_DATA.sections,
          theme: INITIAL_PORTFOLIO_DATA.theme,
          defaultLocale: 'en' as Locale,
          enabledLocales: ['en' as Locale],
          _strapiId: undefined
        };
        
        // Initialize portfolio in reducer
        dispatch({ type: 'INIT_PORTFOLIO', payload: { portfolio: initialPortfolio } });
        
        setActiveLocale(initialPortfolio.defaultLocale);
        setSelectedSectionId(initialPortfolio.sections[0]?.id || null);
        
        setIsLoading(false);
      } catch (error: any) {
        console.error('Failed to load project:', error);
        setLoadError(error.message || 'Failed to load project');
        setIsLoading(false);
      }
    }

    loadProject();
  }, [projectId]);

  // Autosave sections to Supabase
  const { saveStatus, error: saveError, flush } = useAutosave({
    data: portfolio.sections,
    enabled: !isLoading && projectData != null,
    delay: 500,
    onSave: async (sections) => {
      if (!projectData) return;
      
      const savePromises = sections.map(async (section, index) => {
        try {
          // If section already has a Supabase ID, update it
          if (section._strapiDocumentId) {
            const updated = await updateBlock(section._strapiDocumentId, {
              data: {
                sectionData: section.data,
                effects: section.effects,
              },
            });
            
            // Check for conflicts
            if (section._strapiUpdatedAt && updated.updated_at !== section._strapiUpdatedAt) {
              const serverTime = new Date(updated.updated_at).getTime();
              const localTime = new Date(section._strapiUpdatedAt).getTime();
              
              if (serverTime > localTime + 5000) {
                console.warn('⚠️ Server version conflict detected for section:', section.id);
                setShowConflictWarning(true);
              }
            }
            
            return updated;
          } else {
            // Section doesn't have ID yet - create it in Supabase
            console.log('📝 Creating new block for section:', section.id);
            const newBlock = await createBlock(
              projectData.id,
              section.type,
              {
                sectionData: section.data,
                effects: section.effects || { parallax: 0, blur: false, has3d: false },
              },
              index
            );
            
            // Update section with new block metadata
            dispatch({
              type: 'UPDATE_SECTION_METADATA',
              payload: {
                sectionId: section.id,
                metadata: {
                  _strapiDocumentId: newBlock.id,
                  _strapiUpdatedAt: newBlock.updated_at
                },
              },
            });
            
            return newBlock;
          }
        } catch (err: any) {
          console.error(`❌ Failed to save section ${section.id}:`, err);
          throw err;
        }
      });
      
      await Promise.all(savePromises);
    },
  });  const selectedSection = useMemo(() => 
    portfolio.sections.find((s) => s.id === selectedSectionId), 
    [portfolio.sections, selectedSectionId]
  );
  
  const handleUpdateSection = useCallback((sectionId: string, data: any) => {
    dispatch({ type: 'UPDATE_SECTION', payload: { sectionId, data } });
  }, []);

  const handleAddSection = useCallback(async (section: Section) => {
    // Add section locally first for immediate UI update
    dispatch({ type: 'ADD_SECTION', payload: { section } });
    setSelectedSectionId(section.id);
    setJustAddedSectionId(section.id);
    setLibraryOpen(false);
    
    // If we have project data, create block in Supabase
    if (projectData) {
      try {
        const newBlock = await createBlock(
          projectData.id,
          section.type,
          {
            sectionData: section.data,
            effects: section.effects || { parallax: 0, blur: false, has3d: false },
          },
          portfolio.sections.length
        );
        
        // Update section with block metadata
        dispatch({
          type: 'UPDATE_SECTION_METADATA',
          payload: {
            sectionId: section.id,
            metadata: { 
              _strapiDocumentId: newBlock.id,
              _strapiUpdatedAt: newBlock.updated_at 
            },
          },
        });
      } catch (error) {
        console.error('Failed to create block in Supabase:', error);
      }
    }
  }, [projectData, portfolio.sections.length]);

  const handleReorder = useCallback(async (startIndex: number, endIndex: number) => {
    // Reorder locally first
    dispatch({ type: 'REORDER_SECTIONS', payload: { startIndex, endIndex } });
    
    // Update order in Strapi for blocks with IDs
    if (projectData) {
      try {
        const { updateBlock } = await import('./services/strapiApi');
        
        // Get reordered sections
        const sections = Array.from(portfolio.sections);
        const [removed] = sections.splice(startIndex, 1);
        sections.splice(endIndex, 0, removed);
        
        // Update order for all blocks that have Strapi IDs
        const updatePromises = sections
          .filter(section => section._strapiId)
          .map((section, index) =>
            updateBlock(section._strapiId!, { order: index })
          );
        
        await Promise.all(updatePromises);
      } catch (error) {
        console.error('Failed to update block order in Strapi:', error);
      }
    }
  }, [projectData, portfolio.sections]);

  const handleSelectSection = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setInspectorOpen(true); // Open inspector on mobile when a section is selected
  };
  
  useEffect(() => {
    if (justAddedSectionId) {
      const element = document.getElementById(justAddedSectionId);
      if (element) {
        // Use a timeout to ensure the element is rendered before scrolling
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setJustAddedSectionId(null);
        }, 100);
      } else {
        // Reset if element not found for any reason
        setJustAddedSectionId(null);
      }
    }
  }, [justAddedSectionId]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-brand-dark text-brand-light font-sans min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4 text-brand-accent" />
          <p className="text-lg">Loading project...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (loadError) {
    return (
      <div className="bg-brand-dark text-brand-light font-sans min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2">Failed to Load Project</h2>
          <p className="text-brand-mist mb-4">{loadError}</p>
          <div className="space-x-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-brand-accent text-white rounded hover:bg-brand-accent/80"
            >
              Retry
            </button>
            <button
              onClick={async () => {
                await flush(); // Wait for saves before navigating
                navigate('/dashboard/projects');
              }}
              className="px-4 py-2 bg-brand-night text-white rounded hover:bg-brand-night/80"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-dark text-brand-light font-sans min-h-screen flex flex-col">
      <TopBar 
        projectName={projectData?.name || portfolio.name} 
        activeLocale={activeLocale} 
        setActiveLocale={setActiveLocale} 
        enabledLocales={projectData?.enabledLocales || portfolio.enabledLocales} 
        portfolio={portfolio}
        deviceView={deviceView}
        setDeviceView={setDeviceView}
        saveStatus={saveStatus}
        saveError={saveError}
        onBackToDashboard={flush}
      />
      <main className="flex-grow flex w-full h-[calc(100vh-4rem)]">
        {/* Mobile FABs */}
        <div className="md:hidden fixed bottom-4 left-4 z-40">
           <button onClick={() => setLibraryOpen(true)} className="bg-brand-accent text-white p-4 rounded-full shadow-lg">
             <Menu size={24} />
           </button>
        </div>
       
        {/* Library (Desktop Sidebar / Mobile Drawer) */}
        <div className={`fixed md:relative z-50 inset-y-0 left-0 transform ${isLibraryOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
            <Library onAddSection={handleAddSection} />
             <button onClick={() => setLibraryOpen(false)} className="md:hidden absolute top-4 right-4 text-brand-mist hover:text-white">
                <X size={24} />
            </button>
        </div>
        {isLibraryOpen && <div onClick={()=>setLibraryOpen(false)} className="md:hidden fixed inset-0 bg-black/50 z-40 animate-fade-in" />}
        
        {/* Canvas */}
        <div className="flex-grow h-full overflow-y-auto bg-brand-night transition-all duration-300 ease-in-out">
          <Canvas
            sections={portfolio.sections}
            onSelectSection={handleSelectSection}
            selectedSectionId={selectedSectionId}
            activeLocale={activeLocale}
            onReorder={handleReorder}
            deviceView={deviceView}
          />
        </div>
        
        {/* Inspector (Desktop Sidebar / Mobile Bottom Sheet) */}
        <div className={`fixed z-50 bottom-0 left-0 right-0 md:relative md:inset-y-0 md:right-0 md:transform-none transition-transform duration-300 ease-in-out ${isInspectorOpen ? 'translate-y-0' : 'translate-y-full'} md:translate-y-0`}>
          <div className="bg-brand-dark md:w-[350px] h-[75dvh] md:h-full flex flex-col animate-sheet-in md:animate-none">
            <Inspector
                key={selectedSectionId} // Re-mount inspector on selection change
                section={selectedSection}
                onUpdate={handleUpdateSection}
                onUpdateMetadata={(sectionId, metadata) => {
                  dispatch({ type: 'UPDATE_SECTION_METADATA', payload: { sectionId, metadata } });
                }}
                activeLocale={activeLocale}
                onClose={() => setInspectorOpen(false)}
              />
          </div>
        </div>
        {isInspectorOpen && <div onClick={()=>setInspectorOpen(false)} className="md:hidden fixed inset-0 bg-black/50 z-40 animate-fade-in" />}

      </main>
      
      {/* Conflict Warning Modal */}
      {showConflictWarning && (
        <ConflictWarning
          onReload={() => window.location.reload()}
          onDismiss={() => setShowConflictWarning(false)}
        />
      )}
    </div>
  );
}