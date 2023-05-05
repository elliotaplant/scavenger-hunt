export function Header() {
  const tryDefer = async () => {
    try {
      const response = await fetch('/.netlify/functions/try-defer');
      const body = await response.json();
      console.log('body', body);
    } catch (error: any) {
      console.error(error);
    }
  };

  return (
    <header>
      <h1>Scavenger Hunt Generator</h1>
      <p>Generate a scavenger hunt with AI!</p>
      <button onClick={tryDefer}>Try Defer</button>
    </header>
  );
}
