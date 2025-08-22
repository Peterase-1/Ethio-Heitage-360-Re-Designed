import React from 'react';

const TestPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">
          EthioHeritage360 Test Page
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          If you can see this, the app is working! 🎉
        </p>
        <div className="bg-card p-6 rounded-lg border border-border">
          <h2 className="text-2xl font-semibold mb-2">Status Check</h2>
          <p className="text-muted-foreground">
            ✅ React is rendering<br/>
            ✅ Tailwind CSS is working<br/>
            ✅ Custom colors are applied<br/>
            ✅ Router should be working
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
