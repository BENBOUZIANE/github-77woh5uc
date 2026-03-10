package com.cosmetovigilance.config;

import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import java.io.*;
import java.nio.charset.StandardCharsets;

/**
 * Wrapper pour HttpServletRequest qui permet de remplacer le body
 * et de le relire plusieurs fois
 */
public class BufferingRequestWrapper extends HttpServletRequestWrapper {

    private final byte[] cachedBody;

    public BufferingRequestWrapper(HttpServletRequest request, byte[] cachedBody) {
        super(request);
        this.cachedBody = cachedBody;
    }

    @Override
    public ServletInputStream getInputStream() {
        return new BufferingServletInputStream(cachedBody);
    }

    @Override
    public BufferedReader getReader() {
        return new BufferedReader(
                new InputStreamReader(getInputStream(), StandardCharsets.UTF_8)
        );
    }

    /**
     * Classe pour servir le body en tant que ServletInputStream
     */
    public static class BufferingServletInputStream extends ServletInputStream {

        private final ByteArrayInputStream byteArrayInputStream;

        public BufferingServletInputStream(byte[] cachedBody) {
            this.byteArrayInputStream = new ByteArrayInputStream(cachedBody);
        }

        @Override
        public int read() throws IOException {
            return byteArrayInputStream.read();
        }

        @Override
        public boolean isFinished() {
            return byteArrayInputStream.available() == 0;
        }

        @Override
        public boolean isReady() {
            return true;
        }

        @Override
        public void setReadListener(ReadListener readListener) {
            // Non utilisé pour ce cas
        }
    }
}
