import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

const MarkdownRenderer = ({
    content,
    className = "",
}: MarkdownRendererProps) => {
    // Pre-process content để xử lý alignment containers
    const processedContent = content.replace(
        /:::(center|right|justify)\n([\s\S]*?)\n:::/g,
        (alignment, content) => {
            return `<div style="text-align: ${alignment}">\n\n${content.trim()}\n\n</div>`;
        }
    );

    return (
        <div className={`markdown-content max-w-none ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Headings
                    h1: ({ children }) => (
                        <h1 className="text-3xl font-bold text-foreground mb-4 mt-6 border-b border-border pb-2">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-2xl font-semibold text-foreground mb-3 mt-5">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-xl font-medium text-foreground mb-2 mt-4">
                            {children}
                        </h3>
                    ),
                    h4: ({ children }) => (
                        <h4 className="text-lg font-medium text-foreground mb-2 mt-3">
                            {children}
                        </h4>
                    ),
                    h5: ({ children }) => (
                        <h5 className="text-base font-medium text-foreground mb-1 mt-2">
                            {children}
                        </h5>
                    ),
                    h6: ({ children }) => (
                        <h6 className="text-sm font-medium text-muted-foreground mb-1 mt-2">
                            {children}
                        </h6>
                    ),

                    // Text formatting
                    p: ({ children }) => (
                        <p className="text-foreground font-light text-lg mb-4 leading-relaxed">
                            {children}
                        </p>
                    ),
                    strong: ({ children }) => (
                        <strong className="font-bold text-foreground">
                            {children}
                        </strong>
                    ),
                    em: ({ children }) => (
                        <em className="italic text-foreground">{children}</em>
                    ),

                    // Code formatting
                    code: ({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode; [key: string]: any }) => {
                        const match = /language-(\w+)/.exec(className || "");
                        const language = match ? match[1] : "";

                        return !inline && language ? (
                            // Code block với syntax highlighting
                            <div className="my-4">
                                <div className="bg-gray-800 text-gray-200 px-3 py-2 text-xs font-medium rounded-t-lg border-b border-gray-700">
                                    {language.toUpperCase()}
                                </div>
                                <SyntaxHighlighter
                                    style={oneDark}
                                    language={language}
                                    PreTag="div"
                                    className="!mt-0 !rounded-t-none"
                                    customStyle={{
                                        margin: 0,
                                        borderTopLeftRadius: 0,
                                        borderTopRightRadius: 0,
                                    }}
                                    {...props}
                                >
                                    {String(children).replace(/\n$/, "")}
                                </SyntaxHighlighter>
                            </div>
                        ) : (
                            // Inline code
                            <code
                                className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground border"
                                {...props}
                            >
                                {children}
                            </code>
                        );
                    },

                    pre: ({ children }) => (
                        <div className="my-4">{children}</div>
                    ),

                    // Quotes
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 bg-muted/50 rounded-r-lg italic text-muted-foreground">
                            {children}
                        </blockquote>
                    ),

                    // Lists
                    ul: ({ children }) => (
                        <ul className="list-disc list-inside mb-4 space-y-1 text-foreground ml-4">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal list-inside mb-4 space-y-1 text-foreground ml-4">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className="text-foreground mb-1 font-light text-lg">
                            {children}
                        </li>
                    ),

                    // Links and images
                    a: ({ children, href }) => (
                        <a
                            href={href}
                            className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {children}
                        </a>
                    ),
                    img: ({ src, alt }) => (
                        <div>
                            <img
                                src={src}
                                alt={alt}
                                className="max-w-full h-auto rounded-lg mt-12"
                            />
                            {alt && (
                                <div className="text-sm text-muted-foreground mt-2 text-center">
                                    {alt}
                                </div>
                            )}
                        </div>
                    ),

                    // Tables
                    table: ({ children }) => (
                        <div className="overflow-x-auto my-4">
                            <table className="min-w-full border border-border rounded-lg">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-muted">{children}</thead>
                    ),
                    tbody: ({ children }) => (
                        <tbody className="divide-y divide-border">
                            {children}
                        </tbody>
                    ),
                    th: ({ children }) => (
                        <th className="px-4 py-2 text-left font-medium text-foreground border-r border-border last:border-r-0">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="px-4 py-2 text-foreground border-r border-border last:border-r-0">
                            {children}
                        </td>
                    ),

                    // Custom div handler for alignment
                    div: ({ children, style, ...props }) => {
                        const styleObj = style as
                            | React.CSSProperties
                            | undefined;
                        const textAlign = styleObj?.textAlign;

                        if (textAlign) {
                            return (
                                <div
                                    className={`mb-4 ${
                                        textAlign === "center"
                                            ? "text-center"
                                            : textAlign === "right"
                                            ? "text-right"
                                            : textAlign === "justify"
                                            ? "text-justify"
                                            : "text-left"
                                    }`}
                                    {...props}
                                >
                                    {children}
                                </div>
                            );
                        }

                        return (
                            <div className="mb-4" {...props}>
                                {children}
                            </div>
                        );
                    },

                    // Other elements
                    hr: () => <hr className="my-6 border-border" />,

                    // Checkboxes (GitHub Flavored Markdown)
                    input: ({ type, checked, ...props }) => {
                        if (type === "checkbox") {
                            return (
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    disabled
                                    className="mr-2 rounded border-border"
                                    {...props}
                                />
                            );
                        }
                        return <input type={type} {...props} />;
                    },

                    // Strikethrough
                    del: ({ children }) => (
                        <del className="line-through text-muted-foreground">
                            {children}
                        </del>
                    ),
                }}
            >
                {processedContent}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;
