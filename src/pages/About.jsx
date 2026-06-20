export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 pt-24 pb-8">
      <h1 className="text-3xl font-bold">
        About InterviewAce
      </h1>

      <p className="mt-4 text-slate-600">
        InterviewAce is an AI-powered interview preparation platform
        designed to help students and job seekers practice technical
        and HR interviews.
      </p>

      <ul className="mt-6 list-disc pl-6 space-y-2">
        <li>Generate AI interview questions</li>
        <li>Practice mock interviews</li>
        <li>Track learning progress</li>
        <li>Save interview question sets</li>
        <li>Download PDF reports</li>
      </ul>
    </div>
  );
}