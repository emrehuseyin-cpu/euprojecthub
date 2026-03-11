"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = exports.SUPABASE_ANON_KEY = exports.SUPABASE_URL = void 0;
exports.isAtLeast = isAtLeast;
const supabase_js_1 = require("@supabase/supabase-js");
exports.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
exports.SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
if (!exports.SUPABASE_URL || !exports.SUPABASE_ANON_KEY) {
    console.warn('[Core] Supabase URL or Anon Key is missing from environment variables.');
}
exports.supabase = (0, supabase_js_1.createClient)(exports.SUPABASE_URL, exports.SUPABASE_ANON_KEY);
function isAtLeast(current, target) {
    const roles = ['member', 'org_admin', 'super_admin'];
    return roles.indexOf(current || 'member') >= roles.indexOf(target);
}
__exportStar(require("./types"), exports);
