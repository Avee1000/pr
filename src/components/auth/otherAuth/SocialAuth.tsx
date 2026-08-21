import { signInWithGoogle } from "@/app/(marketing)/(auth)/actions";
export default function SocialAuthButtons() {
  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleAppleSignIn = async () => {
    console.log('dsfdfs')
  };

  return (
    <div className="w-full max-w-sm space-y-6">
      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-foreground/10 dark:border-muted-foreground/30" />
        <span className="absolute bg-white dark:bg-black px-3 text-xs text-muted-foreground">
          Or Sign in with
        </span>
      </div>

      {/* Social Buttons Container */}
      <div className="grid sm:grid-cols-2 gap-3">
        {/* Google Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="gsi-material-button flex w-full items-center justify-center gap-2.5 rounded-md border bg-transparent px-4 py-2.5 text-sm font-normal dark:text-white text-ink transition-colors border-muted-foreground/40"
        >
          <div className="gsi-material-button-state"></div>
          <div className="gsi-material-button-content-wrapper flex items-center gap-2.5">
            <div className="gsi-material-button-icon size-5">
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                className="block h-full w-full"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                ></path>
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                ></path>
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                ></path>
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                ></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
            </div>
            <span>Google</span>
          </div>
        </button>

        {/* Apple Button */}
        <button
          type="button"
          onClick={handleAppleSignIn}
          className="apple-material-button flex w-full items-center justify-center gap-2.5 rounded-md border bg-transparent px-4 py-2.5 text-sm font-normal dark:text-white text-ink transition-colors border-muted-foreground/40"
        >
          <div className="apple-material-button-state"></div>
          <div className="apple-material-button-content-wrapper flex items-center gap-2.5">
            <div className="apple-material-button-icon size-5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="100 80 440 480"
                className="block h-full w-full fill-current"
              >
                <path d="M447.1 332.7C446.9 296 463.5 268.3 497.1 247.9C478.3 221 449.9 206.2 412.4 203.3C376.9 200.5 338.1 224 323.9 224C308.9 224 274.5 204.3 247.5 204.3C191.7 205.2 132.4 248.8 132.4 337.5C132.4 363.7 137.2 390.8 146.8 418.7C159.6 455.4 205.8 545.4 254 543.9C279.2 543.3 297 526 329.8 526C361.6 526 378.1 543.9 406.2 543.9C454.8 543.2 496.6 461.4 508.8 424.6C443.6 393.9 447.1 334.6 447.1 332.7zM390.5 168.5C417.8 136.1 415.3 106.6 414.5 96C390.4 97.4 362.5 112.4 346.6 130.9C329.1 150.7 318.8 175.2 321 202.8C347.1 204.8 370.9 191.4 390.5 168.5z" />
              </svg>
            </div>
            <span>Apple</span>
          </div>
        </button>
      </div>
    </div>
  );
}