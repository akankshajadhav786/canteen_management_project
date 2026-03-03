/**
 * Tailwind CSS Test Component
 * Use this to verify Tailwind is working correctly
 * 
 * To test: Import this component in App.tsx and add it to the page
 * import { TailwindTest } from "./components/TailwindTest";
 * <TailwindTest />
 */

export function TailwindTest() {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {/* Test Card */}
      <div className="bg-white rounded-lg shadow-xl p-6 border-2 border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          🎨 Tailwind CSS Test
        </h3>
        
        {/* Color Tests */}
        <div className="space-y-2 mb-4">
          <div className="bg-red-500 text-white p-2 rounded">Red Background</div>
          <div className="bg-blue-500 text-white p-2 rounded">Blue Background</div>
          <div className="bg-green-500 text-white p-2 rounded">Green Background</div>
          <div className="bg-yellow-400 text-black p-2 rounded">Yellow Background</div>
        </div>
        
        {/* Spacing Tests */}
        <div className="space-y-2 mb-4">
          <div className="p-4 bg-gray-100 rounded">Padding Test</div>
          <div className="m-2 bg-gray-200 rounded p-2">Margin Test</div>
        </div>
        
        {/* Typography Tests */}
        <div className="space-y-1 mb-4">
          <p className="text-xs">Extra Small Text</p>
          <p className="text-sm">Small Text</p>
          <p className="text-base">Base Text</p>
          <p className="text-lg">Large Text</p>
          <p className="text-xl">Extra Large Text</p>
        </div>
        
        {/* Flex Tests */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 bg-purple-100 p-2 rounded">Flex 1</div>
          <div className="flex-1 bg-purple-200 p-2 rounded">Flex 2</div>
          <div className="flex-1 bg-purple-300 p-2 rounded">Flex 3</div>
        </div>
        
        {/* Status */}
        <div className="text-center">
          <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
            ✅ Tailwind Working!
          </div>
        </div>
        
        {/* Instructions */}
        <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-900">
          <p className="font-semibold mb-1">If you see this styled card:</p>
          <p>✅ Tailwind CSS is loaded correctly</p>
          <p>✅ Colors, spacing, and typography work</p>
          <p>✅ You can remove this component</p>
        </div>
        
        {/* If NOT working */}
        <div className="mt-2 p-3 bg-red-50 rounded text-sm text-red-900">
          <p className="font-semibold mb-1">If this looks unstyled:</p>
          <p>❌ Check browser console for errors</p>
          <p>❌ Run: npm run dev -- --force</p>
          <p>❌ Clear cache: rm -rf node_modules/.vite</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Simple inline test (for emergency debugging)
 * Copy this to any component to test if inline styles work
 */
export function InlineStyleTest() {
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      backgroundColor: 'red',
      color: 'white',
      padding: '20px',
      borderRadius: '8px',
      zIndex: 9999,
      fontFamily: 'Arial, sans-serif'
    }}>
      <h4 style={{ margin: 0, marginBottom: '10px' }}>Inline Style Test</h4>
      <p style={{ margin: 0 }}>
        If you see this red box, React is working but CSS might not be loading.
      </p>
    </div>
  );
}