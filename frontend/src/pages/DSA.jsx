import { useMemo, useState } from "react";
import {
  Search,
  ExternalLink,
  Code2,
  Building2,
  Tag,
  ChevronDown,
} from "lucide-react";

const dsaProblems = [
  {
    id: 1,
    company: "Google",
    title: "Two Sum",
    topic: "Array",
    link: "https://leetcode.com/problems/two-sum/",
  },
  {
    id: 2,
    company: "Amazon",
    title: "Best Time to Buy and Sell Stock",
    topic: "Array",
    link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
  },
  {
    id: 3,
    company: "Microsoft",
    title: "Reverse Linked List",
    topic: "Linked List",
    link: "https://leetcode.com/problems/reverse-linked-list/",
  },
  {
    id: 4,
    company: "Google",
    title: "Valid Parentheses",
    topic: "Stack",
    link: "https://leetcode.com/problems/valid-parentheses/",
  },
  {
    id: 5,
    company: "Amazon",
    title: "Binary Tree Inorder Traversal",
    topic: "Tree",
    link: "https://leetcode.com/problems/binary-tree-inorder-traversal/",
  },
  {
    id: 6,
    company: "Microsoft",
    title: "Maximum Subarray",
    topic: "Dynamic Programming",
    link: "https://leetcode.com/problems/maximum-subarray/",
  },
];

function DSA() {
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("All");
  const [topicFilter, setTopicFilter] = useState("All");

  const companies = useMemo(() => {
    return ["All", ...new Set(dsaProblems.map((item) => item.company))];
  }, []);

  const topics = useMemo(() => {
    return ["All", ...new Set(dsaProblems.map((item) => item.topic))];
  }, []);

  const filteredProblems = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return dsaProblems.filter((problem) => {
      const matchesSearch =
        !searchText ||
        problem.title.toLowerCase().includes(searchText) ||
        problem.company.toLowerCase().includes(searchText) ||
        problem.topic.toLowerCase().includes(searchText);

      const matchesCompany =
        companyFilter === "All" ||
        problem.company === companyFilter;

      const matchesTopic =
        topicFilter === "All" ||
        problem.topic === topicFilter;

      return matchesSearch && matchesCompany && matchesTopic;
    });
  }, [search, companyFilter, topicFilter]);

  return (
    <main className="min-h-screen bg-slate-100">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300">
                <Code2 size={14} />
                DSA Preparation
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                DSA Problem Sheet
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Practice important Data Structures and Algorithms
                problems from top companies.
              </p>
            </div>

            <div className="flex w-fit items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300">
                <Code2 size={22} />
              </div>

              <div>
                <p className="text-xl font-bold">
                  {dsaProblems.length}
                </p>
                <p className="text-xs text-slate-400">
                  Problems
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Search + Filters */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_200px_200px]">
            {/* Search */}
            <div className="relative">
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search problem, company or topic..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>

            {/* Company */}
            <div className="relative">
              <Building2
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-9 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
              >
                {companies.map((company) => (
                  <option key={company} value={company}>
                    {company === "All"
                      ? "All Companies"
                      : company}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            {/* Topic */}
            <div className="relative">
              <Tag
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-9 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
              >
                {topics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic === "All"
                      ? "All Topics"
                      : topic}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Result count */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Problems
            </h2>

            <p className="text-sm text-slate-500">
              Showing {filteredProblems.length} of{" "}
              {dsaProblems.length} problems
            </p>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    #
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Problem
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Company
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Topic
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                    Practice
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredProblems.map((problem, index) => (
                  <tr
                    key={problem.id}
                    className="border-b border-slate-100 transition hover:bg-slate-50 last:border-b-0"
                  >
                    <td className="px-5 py-4 text-sm font-semibold text-slate-400">
                      {index + 1}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {problem.title}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                        {problem.company}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-600">
                        {problem.topic}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <a
                        href={problem.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
                      >
                        Solve
                        <ExternalLink size={14} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="space-y-3 md:hidden">
          {filteredProblems.map((problem, index) => (
            <div
              key={problem.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-sm font-bold text-indigo-600">
                    {index + 1}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900">
                      {problem.title}
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700">
                        <Building2 size={12} />
                        {problem.company}
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                        <Tag size={12} />
                        {problem.topic}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <a
                href={problem.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.98]"
              >
                Open Problem
                <ExternalLink size={16} />
              </a>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProblems.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Search size={25} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No problems found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or filters.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

export default DSA;