import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="w-full container mx-auto">
      <div className="w-full flex justify-center mt-20">
        <span className="space-y-10">
          <span className="w-full flex justify-center items-center">
            <h2 className="text-3xl font-semibold">Whiteboard App</h2>
          </span>
          <SignUp />
        </span>
      </div>
    </div>
  );
}
