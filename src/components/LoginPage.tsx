'use client';

const AVATARS = ['👨', '👩', '🐱', '🐶', '🦊', '🐻', '🐼', '🐯', '🦁', '🐮'];

export default function LoginPage({ onLogin }: { 
  onLogin: (user: { name: string; avatar: string; id: string }) => void 
}) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const avatar = (form.elements.namedItem('avatar') as HTMLInputElement).value;
    
    onLogin({
      name,
      avatar,
      id: Math.random().toString(36).substr(2, 9)
    });
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-black">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg w-96">
        <h1 className="text-2xl text-white mb-6">Join CollabDraw</h1>
        <input
          type="text"
          name="name"
          placeholder="Enter your name"
          required
          className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
          maxLength={20}
        />
        <div className="grid grid-cols-5 gap-2 mb-4">
          {AVATARS.map((avatar) => (
            <label key={avatar} className="cursor-pointer">
              <input
                type="radio"
                name="avatar"
                value={avatar}
                className="hidden peer"
                required
              />
              <div className="text-2xl p-2 text-center rounded peer-checked:bg-gray-600">
                {avatar}
              </div>
            </label>
          ))}
        </div>
        <button
          type="submit"
          className="w-full bg-white text-black p-2 rounded hover:bg-gray-200"
        >
          Enter Canvas
        </button>
      </form>
    </div>
  );
}
