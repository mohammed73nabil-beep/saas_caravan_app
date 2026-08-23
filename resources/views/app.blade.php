<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    
    <title inertia>{{ config('app.name', 'نظام الكرفانات') }}</title>

    <!-- Theme Initialization Script to Prevent Flash -->
    <script>
        (function() {
            try {
                var theme = localStorage.getItem('theme');
                var userTheme = "{{ auth()->user()?->theme_preference }}";
                
                // Prioritize localStorage first, then backend preference
                var activeTheme = theme || (userTheme && userTheme !== 'system' ? userTheme : 'light');
                
                if (activeTheme === 'dark' || activeTheme === 'slate') {
                    document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                    document.documentElement.setAttribute('data-theme', 'light');
                }
            } catch (e) {}
        })();
    </script>

    <!-- Fonts (Tajawal) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&display=swap" rel="stylesheet">

    <!-- CSS / JS Styles -->
    @viteReactRefresh
    @vite(['resources/js/app.jsx', 'resources/css/app.css'])
    @inertiaHead
</head>
<body class="antialiased">
    @inertia
</body>
</html>
