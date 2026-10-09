/**
 * Plain, robust HTML emails (tables + inline styles for mail clients) with a
 * text alternative. Every interpolated value is HTML-escaped.
 */

export const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export type Row = [label: string, value: string | null | undefined];

function layout(title: string, intro: string, rows: Row[], footer: string, cta?: { label: string; href: string }): string {
  const body = rows
    .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== "")
    .map(
      ([k, v]) => `<tr>
  <td style="padding:10px 16px 10px 0;color:#4a5b72;font:600 13px/1.4 Arial,sans-serif;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td>
  <td style="padding:10px 0;color:#0a1f3d;font:15px/1.5 Arial,sans-serif;white-space:pre-wrap">${escapeHtml(String(v))}</td>
</tr>`,
    )
    .join("\n");
  const button = cta
    ? `<p style="margin:28px 0 0"><a href="${escapeHtml(cta.href)}" style="display:inline-block;background:#ff6700;color:#0a1f3d;font:700 15px Arial,sans-serif;text-decoration:none;padding:12px 22px;border-radius:999px">${escapeHtml(cta.label)}</a></p>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#f2f6fa;padding:24px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:8px 8px 48px 8px;overflow:hidden">
<tr><td style="background:#0a1f3d;padding:24px 32px;color:#ffffff;font:800 22px/1.1 Arial Narrow,Arial,sans-serif;letter-spacing:.02em;text-transform:uppercase">ADS Global <span style="color:#ff6700">Limited</span></td></tr>
<tr><td style="padding:32px">
<h1 style="margin:0 0 12px;color:#0a1f3d;font:800 24px/1.2 Arial,sans-serif">${escapeHtml(title)}</h1>
<p style="margin:0 0 20px;color:#4a5b72;font:15px/1.6 Arial,sans-serif">${escapeHtml(intro)}</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-top:1px solid #d9e2ec">${body}</table>
${button}
</td></tr>
<tr><td style="padding:20px 32px;background:#f2f6fa;color:#4a5b72;font:12px/1.6 Arial,sans-serif">${escapeHtml(footer)}</td></tr>
</table></body></html>`;
}

function plain(title: string, intro: string, rows: Row[], footer: string, cta?: { label: string; href: string }): string {
  const lines = rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`);
  return [title, "", intro, "", ...lines, ...(cta ? ["", `${cta.label}: ${cta.href}`] : []), "", "—", footer].join("\n");
}

export function render(opts: { title: string; intro: string; rows: Row[]; footer: string; cta?: { label: string; href: string } }) {
  return { html: layout(opts.title, opts.intro, opts.rows, opts.footer, opts.cta), text: plain(opts.title, opts.intro, opts.rows, opts.footer, opts.cta) };
}
