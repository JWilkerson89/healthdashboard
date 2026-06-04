import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Typography, Box, Link } from '@mui/material';

/**
 * Renders journal note markdown with MUI styling. remark-breaks keeps the
 * single-newline line breaks the notes are authored with; react-markdown is
 * XSS-safe (no raw HTML) by default.
 */
export default function Markdown({ children }: { children: string }) {
  return (
    <Box sx={{ '& > :first-of-type': { mt: 0 }, '& > :last-child': { mb: 0 } }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          p: ({ children }) => (
            <Typography variant="body2" sx={{ mb: 1.25, lineHeight: 1.6 }}>
              {children}
            </Typography>
          ),
          strong: ({ children }) => (
            <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {children}
            </Box>
          ),
          em: ({ children }) => <Box component="span" sx={{ fontStyle: 'italic' }}>{children}</Box>,
          ul: ({ children }) => (
            <Box component="ul" sx={{ pl: 3, mt: 0, mb: 1.25 }}>
              {children}
            </Box>
          ),
          ol: ({ children }) => (
            <Box component="ol" sx={{ pl: 3, mt: 0, mb: 1.25 }}>
              {children}
            </Box>
          ),
          li: ({ children }) => (
            <Typography component="li" variant="body2" sx={{ mb: 0.25, lineHeight: 1.6 }}>
              {children}
            </Typography>
          ),
          h1: ({ children }) => <Typography variant="h6" sx={{ mt: 1, mb: 1 }}>{children}</Typography>,
          h2: ({ children }) => <Typography variant="subtitle1" sx={{ mt: 1, mb: 0.75, fontWeight: 700 }}>{children}</Typography>,
          h3: ({ children }) => <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5, fontWeight: 700 }}>{children}</Typography>,
          a: ({ href, children }) => (
            <Link href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </Link>
          ),
          code: ({ children }) => (
            <Box
              component="code"
              sx={{ px: 0.5, py: 0.1, borderRadius: 0.5, bgcolor: 'action.hover', fontSize: '0.85em' }}
            >
              {children}
            </Box>
          ),
          blockquote: ({ children }) => (
            <Box sx={{ borderLeft: '3px solid', borderColor: 'divider', pl: 1.5, my: 1, color: 'text.secondary' }}>
              {children}
            </Box>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </Box>
  );
}
